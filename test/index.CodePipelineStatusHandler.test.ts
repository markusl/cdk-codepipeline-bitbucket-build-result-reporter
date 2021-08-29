import * as CodePipeline from '@aws-sdk/client-codepipeline';
import type * as AwsLambda from 'aws-lambda';
import '@aws-cdk/assert/jest';
import { buildBitbucketBuildStatusBody } from '../src/index.CodePipelineStatusHandler';

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

test('buildBitbucketBuildStatus InProgress', () => {
  expect(buildBitbucketBuildStatusBody(event('STARTED'), CodePipeline.ActionExecutionStatus.InProgress)).toMatchObject({
    description: 'Prod-myAction',
    key: 'Prod-myAction',
    name: 'Prod-myAction',
    state: 'INPROGRESS',
    url: 'https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/myPipeline/view',
  });
});

test('buildBitbucketBuildStatus Succeeded', () => {
  expect(buildBitbucketBuildStatusBody(event('SUCCEEDED'), CodePipeline.ActionExecutionStatus.Succeeded)).toMatchObject({
    description: 'Prod-myAction',
    key: 'Prod-myAction',
    name: 'Prod-myAction',
    state: 'SUCCESSFUL',
    url: 'https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/myPipeline/view',
  });
});

test('buildBitbucketBuildStatus Superseded', () => {
  expect(buildBitbucketBuildStatusBody(event('CANCELED'), CodePipeline.ActionExecutionStatus.Abandoned)).toMatchObject({
    description: 'Prod-myAction',
    key: 'Prod-myAction',
    name: 'Prod-myAction',
    state: 'SUCCESSFUL',
    url: 'https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/myPipeline/view',
  });
});

test('buildBitbucketBuildStatus FAILED Manual Approval is reported as success', () => {
  expect(buildBitbucketBuildStatusBody(event('FAILED', {
    owner: 'AWS',
    provider: 'Manual',
    category: 'Approval',
    version: 1,
  }), CodePipeline.ActionExecutionStatus.Abandoned)).toMatchObject({
    description: 'Prod-myAction',
    key: 'Prod-myAction',
    name: 'Prod-myAction',
    state: 'SUCCESSFUL',
    url: 'https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/myPipeline/view',
  });
});
