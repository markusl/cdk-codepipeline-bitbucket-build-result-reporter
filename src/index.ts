import * as ec2 from '@aws-cdk/aws-ec2';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambda_nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';

const addCodePipelineActionStateChangeEventRule = (scope: cdk.Construct, states: string[], handler: lambda.IFunction) => {
  new events.Rule(scope, 'CodePipelineActionExecutionStateChangeRule', {
    eventPattern: {
      detailType: ['CodePipeline Action Execution State Change'],
      source: ['aws.codepipeline'],
      detail: { state: states },
    },
    targets: [new targets.LambdaFunction(handler)],
  });
};

const addCodeBuildStateChangeEventRule = (scope: cdk.Construct, states: string[], handler: lambda.IFunction) => {
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
export class CodePipelineBitbucketBuildResultReporter extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: CodePipelineBitbucketBuildResultReporterProps) {
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
      runtime: lambda.Runtime.NODEJS_12_X,
      memorySize: 256,
      description: 'Synchronize CodePipeline build statuses to BitBucket',
      environment: {
        BITBUCKET_SERVER: props.bitbucketServerAddress,
        BITBUCKET_TOKEN: bitbucketTokenName,
      },
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
