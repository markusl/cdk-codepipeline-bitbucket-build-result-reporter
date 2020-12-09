import * as path from 'path';
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

    const codePipelineResultHandler = new lambda_nodejs.NodejsFunction(scope, 'CodePipelineBuildResultHandler', {
      entry: path.join(__dirname, 'index.handler.ts'),
      vpc: ec2.Vpc.fromVpcAttributes(scope, 'LambdaVpc', props.vpc),
      runtime: lambda.Runtime.NODEJS_12_X,
      memorySize: 256,
      description: 'Synchronize CodePipeline build statuses to BitBucket',
      environment: {
        BITBUCKET_SERVER: props.bitbucketServerAddress,
        BITBUCKET_TOKEN: bitbucketTokenName,
      },
    });
    codePipelineResultHandler.role?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      resources: [`arn:aws:ssm:*:*:parameter/${bitbucketTokenName}`],
    }));
    codePipelineResultHandler.role?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['codepipeline:GetPipelineExecution'],
      resources: ['arn:aws:codepipeline:*:*:*'],
    }));

    // https://docs.aws.amazon.com/codepipeline/latest/userguide/detect-state-changes-cloudwatch-events.html
    const states = ['STARTED', 'SUCCEEDED', 'FAILED', 'CANCELED'];
    addCodePipelineActionStateChangeEventRule(scope, states, codePipelineResultHandler);
  }
}
