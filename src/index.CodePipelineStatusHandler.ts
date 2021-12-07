import * as CodePipeline from '@aws-sdk/client-codepipeline';
import type * as AwsLambda from 'aws-lambda';
import { BitbucketBuildStatus, putCodePipelineResultToBitBucket } from './bitbucket';
import { getCurrentAccountAlias } from './iam-helper';

const codePipeline = new CodePipeline.CodePipelineClient({});


export const buildBitbucketBuildStatusBody = async (
  event: AwsLambda.CodePipelineCloudWatchActionEvent,
  actionStatus: CodePipeline.ActionExecutionStatus): Promise<BitbucketBuildStatus> => {
  const detail = event.detail;
  const state =
    actionStatus === 'InProgress' ? 'INPROGRESS' :
      actionStatus === 'Succeeded' ? 'SUCCESSFUL' :
        actionStatus === 'Abandoned' ? 'SUCCESSFUL' : 'FAILED';

  console.log(`${detail['execution-id']} Build status ${state} being reported for ${detail.pipeline} ${detail.stage}-${detail.action}`);

  return {
    state,
    key: `${detail.stage}-${detail.action}`,
    name: `CodePipeline ${detail.pipeline} ${detail.stage}/${detail.action} (${await getCurrentAccountAlias(event.account)} @ ${event.region})`,
    url: `https://${event.region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${detail.pipeline}/view`,
    description: `${detail.stage}-${detail.action}`,
  };
};

const fetchExecution = async (event: AwsLambda.CodePipelineCloudWatchActionEvent) => {
  const detail = event.detail;
  const execution = await codePipeline.send(new CodePipeline.GetPipelineExecutionCommand({
    pipelineName: detail.pipeline,
    pipelineExecutionId: detail['execution-id'],
  }));

  if (!execution.pipelineExecution) {
    throw new Error(`Could not fetch execution ${detail['execution-id']}`);
  }

  return execution.pipelineExecution;
};

export const getPipelineActionLatestStatus = async (event: AwsLambda.CodePipelineCloudWatchActionEvent) => {
  const pipelineState = await codePipeline.send(new CodePipeline.GetPipelineStateCommand({
    name: event.detail.pipeline,
  }));

  if (event.detail.type.provider === 'Manual' && event.detail.type.category === 'Approval') {
    return CodePipeline.ActionExecutionStatus.Abandoned;
  }

  const stageStates = pipelineState.stageStates?.find((s) => s.stageName === event.detail.stage);
  const action = stageStates?.actionStates?.find((a) => a.actionName === event.detail.action);
  return action?.latestExecution?.status as CodePipeline.ActionExecutionStatus ?? CodePipeline.ActionExecutionStatus.Failed;
};

exports.handler = async (event: AwsLambda.CodePipelineCloudWatchActionEvent) => {
  // console.log(JSON.stringify(event, undefined, 2));

  try {
    const actionStatus = await getPipelineActionLatestStatus(event);
    const status = await buildBitbucketBuildStatusBody(event, actionStatus);

    const pipelineExecution = await fetchExecution(event);
    const revisions = pipelineExecution.artifactRevisions ?? [{ revisionChangeIdentifier: '' }];
    const revision = revisions[0].revisionId ?? '';

    const result = await putCodePipelineResultToBitBucket(revision, JSON.stringify(status));
    console.log(result);
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
