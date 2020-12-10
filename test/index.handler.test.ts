import type * as AwsLambda from 'aws-lambda';
import '@aws-cdk/assert/jest';
import { buildBitbucketBuildStatusBody } from '../src/index.handler';

const event = (state: AwsLambda.CodePipelineActionState): AwsLambda.CodePipelineCloudWatchActionEvent => ({
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
    'type': {
      owner: 'AWS',
      category: 'Deploy',
      provider: 'CodeDeploy',
      version: 1,
    },
  },
});

test('buildBitbucketBuildStatus InProgress', () => {
  expect(buildBitbucketBuildStatusBody(event('STARTED'), 'InProgress')).toMatchObject({
    description: 'Prod-myAction',
    key: 'Prod-myAction',
    name: 'myAction',
    state: 'INPROGRESS',
    url: 'https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/myPipeline/view',
  });
});

test('buildBitbucketBuildStatus Succeeded', () => {
  expect(buildBitbucketBuildStatusBody(event('SUCCEEDED'), 'Succeeded')).toMatchObject({
    description: 'Prod-myAction',
    key: 'Prod-myAction',
    name: 'myAction',
    state: 'SUCCESSFUL',
    url: 'https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/myPipeline/view',
  });
});

test('buildBitbucketBuildStatus Superseded', () => {
  expect(buildBitbucketBuildStatusBody(event('CANCELED'), 'Abandoned')).toMatchObject({
    description: 'Prod-myAction',
    key: 'Prod-myAction',
    name: 'myAction',
    state: 'SUCCESSFUL',
    url: 'https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/myPipeline/view',
  });
});
