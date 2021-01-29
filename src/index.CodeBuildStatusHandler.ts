import type * as AwsLambda from 'aws-lambda';
import { BitbucketBuildStatus, putCodePipelineResultToBitBucket } from './bitbucket';

export const buildBitbucketBuildStatusBody = (
  event: AwsLambda.CodeBuildCloudWatchStateEvent,
  actionStatus: AwsLambda.CodeBuildStateType): BitbucketBuildStatus => {
  const detail = event.detail;
  const state =
    actionStatus === 'IN_PROGRESS' ? 'INPROGRESS' :
      actionStatus === 'SUCCEEDED' ? 'SUCCESSFUL' : 'FAILED';

  // console.log(`${detail['execution-id']} Build status ${state} being reported for ${detail.pipeline} ${detail.stage}-${detail.action}`);

  return {
    state,
    key: `${detail['project-name']}-${detail['build-status']}-${detail['current-phase']}`,
    name: `${detail['project-name']}-${detail['build-status']}`,
    url: `https://${event.region}.console.aws.amazon.com/codesuite/codebuild/459568918122/projects/${detail['project-name']}/build/${detail['project-name']}:${detail['build-id']}/?region=${event.region}`,
    description: `${detail['project-name']} build initiated by ${detail['additional-information'].initiator} at ${detail['additional-information']['build-start-time']}`,
  };
};

exports.handler = async (event: AwsLambda.CodeBuildCloudWatchStateEvent) => {
  // console.log(JSON.stringify(event, undefined, 2));

  try {
    const status = buildBitbucketBuildStatusBody(event, event.detail['build-status']);

    const result = await putCodePipelineResultToBitBucket(event.detail['additional-information']['source-version'], JSON.stringify(status));
    console.log(result);
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
