import {
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_logs as logs,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
  aws_events as events,
  aws_events_targets as targets,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

const addCodePipelineActionStateChangeEventRule = (scope: Construct, states: string[], handler: lambda.IFunction) => {
  new events.Rule(scope, 'CodePipelineActionExecutionStateChangeRule', {
    eventPattern: {
      detailType: ['CodePipeline Action Execution State Change'],
      source: ['aws.codepipeline'],
      detail: { state: states },
    },
    targets: [new targets.LambdaFunction(handler)],
  });
};

const addCodeBuildStateChangeEventRule = (scope: Construct, states: string[], handler: lambda.IFunction) => {
  new events.Rule(scope, 'CodeCodeBuildStateChangeEventRule', {
    eventPattern: {
      detailType: ['CodeBuild Build State Change'],
      source: ['aws.codebuild'],
      detail: { 'build-status': states },
    },
    targets: [new targets.LambdaFunction(handler)],
  });
};

export interface CodePipelineBitbucketBuildResultReporterProps {
  /**
   * The VPC in which to run the status reporter.
   */
  readonly vpc: ec2.VpcAttributes;

  /**
   * Name of the SSM parameter that contains the BitBucket access token.
   * @default BITBUCKET_UPDATE_BUILD_STATUS_TOKEN
   */
  readonly bitbucketTokenName?: string;

  /**
   * The BitBucket server address.
   */
  readonly bitbucketServerAddress: string;
}

/** A construct for reporting CodePipeline build statuses to a BitBucket server using BitBucket REST API.
 * You need to configure SSM parameter BITBUCKET_UPDATE_BUILD_STATUS_TOKEN before using the component.
 */
export class CodePipelineBitbucketBuildResultReporter extends Construct {
  constructor(scope: Construct, id: string, props: CodePipelineBitbucketBuildResultReporterProps) {
    super(scope, id);
    const bitbucketTokenName = props.bitbucketTokenName ?? 'BITBUCKET_UPDATE_BUILD_STATUS_TOKEN';
    const vpc = ec2.Vpc.fromVpcAttributes(scope, 'LambdaVpc', props.vpc);
    const codePipelineStatusHandler = new lambda_nodejs.NodejsFunction(scope, 'CodePipelineStatusHandler', {
      vpc,
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 256,
      description: 'Synchronize CodePipeline build statuses to BitBucket',
      environment: {
        BITBUCKET_SERVER: props.bitbucketServerAddress,
        BITBUCKET_TOKEN: bitbucketTokenName,
      },
      logRetention: logs.RetentionDays.ONE_MONTH,
    });
    codePipelineStatusHandler.role?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      resources: [`arn:aws:ssm:*:*:parameter/${bitbucketTokenName}`],
    }));
    codePipelineStatusHandler.role?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['codepipeline:GetPipelineExecution', 'codepipeline:GetPipelineState'],
      resources: ['arn:aws:codepipeline:*:*:*'],
    }));

    // https://docs.aws.amazon.com/codepipeline/latest/userguide/detect-state-changes-cloudwatch-events.html
    const codePipelineStates = ['STARTED', 'SUCCEEDED', 'FAILED', 'CANCELED'];
    addCodePipelineActionStateChangeEventRule(scope, codePipelineStates, codePipelineStatusHandler);

    const codeBuildStatusHandler = new lambda_nodejs.NodejsFunction(scope, 'CodeBuildStatusHandler', {
      vpc,
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 256,
      description: 'Synchronize CodeBuild build statuses to BitBucket',
      environment: {
        BITBUCKET_SERVER: props.bitbucketServerAddress,
        BITBUCKET_TOKEN: bitbucketTokenName,
      },
      logRetention: logs.RetentionDays.ONE_MONTH,
    });
    codeBuildStatusHandler.role?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      resources: [`arn:aws:ssm:*:*:parameter/${bitbucketTokenName}`],
    }));
    codeBuildStatusHandler.role?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['codebuild:BatchGetBuilds'],
      resources: ['*'],
    }));
    // https://docs.aws.amazon.com/codepipeline/latest/userguide/detect-state-changes-cloudwatch-events.html
    const codeBuildStates = ['IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'STOPPED'];
    addCodeBuildStateChangeEventRule(scope, codeBuildStates, codeBuildStatusHandler);
  }
}
