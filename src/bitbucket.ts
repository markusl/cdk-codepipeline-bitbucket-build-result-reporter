import * as AWS from '@aws-sdk/client-ssm';
import fetch from 'node-fetch';

const ssm = new AWS.SSM({});

export const getToken = async (Name: string) => {
  const result = await ssm.getParameter({ Name, WithDecryption: true });
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
export const putCodePipelineResultToBitBucket = async (commitId: string, body: string) => {
  if (!process.env.BITBUCKET_TOKEN) {
    throw new Error('Missing BITBUCKET_TOKEN');
  }
  const token = await getToken(process.env.BITBUCKET_TOKEN);

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
