import * as SSM from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import { getToken } from '../src/bitbucket';

const ssmMock = mockClient(SSM.SSMClient);

const paramName = 'EXAMPLE_TOKEN';
const exampleToken = 'frhWbyXaEPprfZRZXiuCUfmwMr6a0SAchp1JINHW7tXN21RZjF5jTcKaRr9kbm2';

test('getToken returns the token', async () => {
  ssmMock.on(SSM.GetParameterCommand, {
    Name: paramName,
  }).resolves({
    Parameter: {
      Value: exampleToken,
    },
  });

  expect(await getToken(paramName)).toBe(exampleToken);
});

test('getToken fails with incorrect token', async () => {
  ssmMock.on(SSM.GetParameterCommand, {
    Name: paramName,
  }).resolves({
    Parameter: {
      Value: exampleToken,
    },
  });

  await expect(getToken('invalid-token')).rejects.toThrow(/Cannot fetch token/);
});
