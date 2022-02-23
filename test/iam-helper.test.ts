import * as IAM from '@aws-sdk/client-iam';
import { mockClient } from 'aws-sdk-client-mock';
import { getCurrentAccountAlias } from '../src/iam-helper';

const iamMock = mockClient(IAM.IAMClient);

test('getCurrentAccountAlias returns account alias', async () => {
  iamMock.on(IAM.ListAccountAliasesCommand).resolves({
    AccountAliases: [
      'account-alias',
    ],
  });

  expect(await getCurrentAccountAlias('0987654321')).toBe('account-alias');
});

test('getCurrentAccountAlias returns account id if no aliases found', async () => {
  iamMock.on(IAM.ListAccountAliasesCommand).resolves({
    AccountAliases: [],
  });

  expect(await getCurrentAccountAlias('0987654321')).toBe('0987654321');
});

test('getCurrentAccountAlias handles promise rejection', async () => {
  iamMock.on(IAM.ListAccountAliasesCommand).rejects();

  expect(await getCurrentAccountAlias('0987654321')).toBe('0987654321');
});
