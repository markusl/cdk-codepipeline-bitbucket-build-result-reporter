import * as IAM from '@aws-sdk/client-iam';

const iam = new IAM.IAMClient({});

export const getCurrentAccountAlias = async (accountId: string) => {
  try {
    const aliases = await iam.send(new IAM.ListAccountAliasesCommand({}));
    if (aliases.AccountAliases && aliases.AccountAliases.length > 0) {
      return aliases.AccountAliases[0];
    }
    return accountId;
  } catch (err) {
    console.error(err);
    return accountId;
  }
};
