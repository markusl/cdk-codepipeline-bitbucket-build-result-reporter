import type * as AwsLambda from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { BitbucketBuildStatus, putCodePipelineResultToBitBucket } from './bitbucket';

const codePipeline = new AWS.CodePipeline();

export const buildBitbucketBuildStatusBody = (
  event: AwsLambda.CodePipelineCloudWatchActionEvent,
  actionStatus: AWS.CodePipeline.ActionExecutionStatus): BitbucketBuildStatus => {
  const detail = event.detail;
  const state =
    actionStatus === 'InProgress' ? 'INPROGRESS' :
      actionStatus === 'Succeeded' ? 'SUCCESSFUL' :
        actionStatus === 'Abandoned' ? 'SUCCESSFUL' : 'FAILED';

  console.log(`${detail['execution-id']} Build status ${state} being reported for ${detail.pipeline} ${detail.stage}-${detail.action}`);

  return {
    state,
    key: `${detail.stage}-${detail.action}`,
    name: detail.action,
    url: `https://${event.region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${detail.pipeline}/view`,
    description: `${detail.stage}-${detail.action}`,
  };
};

const fetchExecution = async (event: AwsLambda.CodePipelineCloudWatchActionEvent) => {
  const detail = event.detail;
  const execution = await codePipeline.getPipelineExecution({
    pipelineName: detail.pipeline,
    pipelineExecutionId: detail['execution-id'],
  }).promise();

  if (!execution.pipelineExecution) {
    throw new Error(`Could not fetch execution ${detail['execution-id']}`);
  }

  return execution.pipelineExecution;
};

const getPipelineActionLatestStatus = async (event: AwsLambda.CodePipelineCloudWatchActionEvent): Promise<AWS.CodePipeline.ActionExecutionStatus> => {
  const pipelineState = await codePipeline.getPipelineState({
    name: event.detail.pipeline,
  }).promise();

  const stageStates = pipelineState.stageStates?.find((s) => s.stageName === event.detail.stage);
  const action = stageStates?.actionStates?.find((a) => a.actionName === event.detail.action);
  return action?.latestExecution?.status ?? 'Failed';
};

exports.handler = async (event: AwsLambda.CodePipelineCloudWatchActionEvent) => {
  // console.log(JSON.stringify(event, undefined, 2));

  try {
    const actionStatus = await getPipelineActionLatestStatus(event);
    const status = buildBitbucketBuildStatusBody(event, actionStatus);

    const pipelineExecution = await fetchExecution(event);
    const revisions = pipelineExecution.artifactRevisions ?? [{ revisionChangeIdentifier: '' }];
    const revision = revisions[0].revisionId ?? '';

    const result = await putCodePipelineResultToBitBucket(revision, JSON.stringify(status));
    console.log(result);
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
