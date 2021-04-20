import type * as AwsLambda from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { BitbucketBuildStatus, putCodePipelineResultToBitBucket } from './bitbucket';

const codeBuild = new AWS.CodeBuild();

export const buildBitbucketBuildStatusBody = (
  event: AwsLambda.CodeBuildCloudWatchStateEvent,
  actionStatus: AwsLambda.CodeBuildStateType): BitbucketBuildStatus => {
  const detail = event.detail;
  const state =
    actionStatus === 'IN_PROGRESS' ? 'INPROGRESS' :
      actionStatus === 'SUCCEEDED' ? 'SUCCESSFUL' : 'FAILED';

  // console.log(`${detail['execution-id']} Build status ${state} being reported for ${detail.pipeline} ${detail.stage}-${detail.action}`);

  // The actual build id is at the end of the full ARN
  const buildId = detail['build-id'].split(':').slice(-1)[0];
  return {
    state,
    key: `${detail['project-name']}-${buildId}`,
    name: `CodeBuild-${detail['project-name']}-${detail['build-status']}`,
    url: `https://${event.region}.console.aws.amazon.com/codesuite/codebuild/459568918122/projects/${detail['project-name']}/build/${detail['project-name']}:${buildId}/?region=${event.region}`,
    description: `${detail['project-name']} build initiated by ${detail['additional-information'].initiator} at ${detail['additional-information']['build-start-time']}`,
  };
};

export const getCommitId = async (buildId: string) => {
  const build = await codeBuild.batchGetBuilds({
    ids: [buildId],
  }).promise();

  if (!build.builds || !build.builds[0].sourceVersion) {
    throw new Error('Failed to get builds');
  }
  return build.builds[0].sourceVersion;
};

exports.handler = async (event: AwsLambda.CodeBuildCloudWatchStateEvent) => {
  // console.log(JSON.stringify(event, undefined, 2));

  try {
    const status = buildBitbucketBuildStatusBody(event, event.detail['build-status']);
    const commitId = await getCommitId(event.detail['build-id']);

    // Skip S3 events. See https://docs.aws.amazon.com/codebuild/latest/userguide/sample-source-version.html
    if (!commitId.startsWith('arn:aws:s3')) {
      const result = await putCodePipelineResultToBitBucket(commitId, JSON.stringify(status));
      console.log({
        commitId,
        ...result,
      });
    }
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
