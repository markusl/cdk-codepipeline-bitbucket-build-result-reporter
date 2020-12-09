import type * as AwsLambda from 'aws-lambda';
import * as AWS from 'aws-sdk';
import fetch from 'node-fetch';

const codePipeline = new AWS.CodePipeline();
const ssm = new AWS.SSM();

const getToken = async (Name: string) => {
  const result = await ssm.getParameter({ Name, WithDecryption: true }).promise();
  if (result.Parameter && result.Parameter.Value) {
    return result.Parameter?.Value;
  }
  throw new Error('Cannot fetch token');
};

export interface BitbucketBuildStatus {
  'state': 'INPROGRESS' | 'SUCCESSFUL' | 'FAILED';
  'key': string;
  'name': string;
  'url': string;
  'description': string;
}

// See https://docs.atlassian.com/bitbucket-server/rest/4.0.0/bitbucket-build-rest.html
const putCodePipelineResultToBitBucket = async (token: string, commitId: string, body: string) => {
  const bitbucketBuildStatusUrl = `https://${process.env.BITBUCKET_SERVER}/rest/build-status/1.0/commits/${commitId}`;
  const response = await fetch(bitbucketBuildStatusUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (response.status === 204) {
    return { status: 'ok' };
  }

  return response.json();
};

export const buildBitbucketBuildStatusBody = (event: AwsLambda.CodePipelineCloudWatchActionEvent): BitbucketBuildStatus => {
  const detail = event.detail;
  const state = detail.state === 'STARTED' ? 'INPROGRESS' : detail.state === 'SUCCEEDED' ? 'SUCCESSFUL' : 'FAILED';
  console.log(`${detail['execution-id']} Build status ${state} being reported for ${detail.pipeline} ${detail.stage}-${detail.action}`);

  return {
    state,
    key: `${detail.stage}-${detail.action}`,
    name: detail.action,
    url: `https://${event.region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${detail.pipeline}/view`,
    description: `${detail.stage}-${detail.action}`,
  };
};

exports.handler = async (event: AwsLambda.CodePipelineCloudWatchActionEvent) => {
  // console.log(JSON.stringify(event, undefined, 2));

  try {
    if (!process.env.BITBUCKET_TOKEN) {
      throw new Error('Missing BITBUCKET_TOKEN');
    }
    const token = await getToken(process.env.BITBUCKET_TOKEN);

    const detail = event.detail;
    const execution = await codePipeline.getPipelineExecution({
      pipelineName: detail.pipeline,
      pipelineExecutionId: detail['execution-id'],
    }).promise();
    const status = buildBitbucketBuildStatusBody(event);
    const revisions = execution.pipelineExecution?.artifactRevisions ?? [{ revisionChangeIdentifier: '' }];
    const revision = revisions[0].revisionId ?? '';

    const result = await putCodePipelineResultToBitBucket(token, revision, JSON.stringify(status));
    console.log(result);
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
