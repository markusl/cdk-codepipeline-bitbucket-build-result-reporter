import * as CodePipeline from '@aws-sdk/client-codepipeline';
import type * as AwsLambda from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import '@aws-cdk/assert/jest';
import { buildBitbucketBuildStatusBody, getPipelineActionLatestStatus } from '../src/index.CodePipelineStatusHandler';

const codePipelineMock = mockClient(CodePipeline.CodePipelineClient);

const event = (state: AwsLambda.CodePipelineActionState, type = {
  owner: 'AWS' as 'AWS' | 'Custom' | 'ThirdParty',
  category: 'Deploy' as AwsLambda.CodePipelineActionCategory,
  provider: 'CodeDeploy',
  version: 1,
}): AwsLambda.CodePipelineCloudWatchActionEvent => ({
  'version': '0',
  'id': 'event_Id',
  'detail-type': 'CodePipeline Action Execution State Change',
  'source': 'aws.codepipeline',
  'account': 'Pipeline_Account',
  'time': 'TimeStamp',
  'region': 'us-east-1',
  'resources': [
    'arn:aws:codepipeline:us-east-1:account_ID:myPipeline',
  ],
  'detail': {
    'pipeline': 'myPipeline',
    'version': 1,
    'execution-id': 'execution_Id',
    'stage': 'Prod',
    'action': 'myAction',
    'state': state,
    'type': type,
  },
});

test('buildBitbucketBuildStatus InProgress', async () => {
  expect(await buildBitbucketBuildStatusBody(event('STARTED'), CodePipeline.ActionExecutionStatus.InProgress)).toMatchObject({
    description: 'Prod-myAction',
    key: 'Prod-myAction',
    name: 'CodePipeline myPipeline Prod/myAction (Pipeline_Account @ us-east-1)',
    state: 'INPROGRESS',
    url: 'https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/myPipeline/view',
  });
});

test('buildBitbucketBuildStatus Succeeded', async () => {
  expect(await buildBitbucketBuildStatusBody(event('SUCCEEDED'), CodePipeline.ActionExecutionStatus.Succeeded)).toMatchObject({
    description: 'Prod-myAction',
    key: 'Prod-myAction',
    name: 'CodePipeline myPipeline Prod/myAction (Pipeline_Account @ us-east-1)',
    state: 'SUCCESSFUL',
    url: 'https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/myPipeline/view',
  });
});

test('buildBitbucketBuildStatus Superseded', async () => {
  expect(await buildBitbucketBuildStatusBody(event('CANCELED'), CodePipeline.ActionExecutionStatus.Abandoned)).toMatchObject({
    description: 'Prod-myAction',
    key: 'Prod-myAction',
    name: 'CodePipeline myPipeline Prod/myAction (Pipeline_Account @ us-east-1)',
    state: 'SUCCESSFUL',
    url: 'https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/myPipeline/view',
  });
});

test('buildBitbucketBuildStatus FAILED Manual Approval is reported as success', async () => {
  expect(await buildBitbucketBuildStatusBody(event('FAILED', {
    owner: 'AWS',
    provider: 'Manual',
    category: 'Approval',
    version: 1,
  }), CodePipeline.ActionExecutionStatus.Abandoned)).toMatchObject({
    description: 'Prod-myAction',
    key: 'Prod-myAction',
    name: 'CodePipeline myPipeline Prod/myAction (Pipeline_Account @ us-east-1)',
    state: 'SUCCESSFUL',
    url: 'https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/myPipeline/view',
  });
});

test('getPipelineActionLatestStatus returns action status for successful event', async () => {
  const output: CodePipeline.GetPipelineStateCommandOutput = {
    $metadata: {},
    stageStates: [
      {
        stageName: 'Prod',
        actionStates: [
          {
            actionName: 'myAction',
            latestExecution: {
              status: CodePipeline.ActionExecutionStatus.Succeeded,
            },
          },
        ],
      },
    ],
  };
  codePipelineMock.on(CodePipeline.GetPipelineStateCommand).resolves(output);

  expect(await getPipelineActionLatestStatus(event('SUCCEEDED'))).toBe(CodePipeline.ActionExecutionStatus.Succeeded);
});

test('getPipelineActionLatestStatus returns failure when event is not found', async () => {
  const output: CodePipeline.GetPipelineStateCommandOutput = {
    $metadata: {},
    stageStates: [],
  };
  codePipelineMock.on(CodePipeline.GetPipelineStateCommand).resolves(output);

  expect(await getPipelineActionLatestStatus(event('SUCCEEDED'))).toBe(CodePipeline.ActionExecutionStatus.Failed);
});
