[![NPM version](https://badge.fury.io/js/cdk-codepipeline-bitbucket-build-result-reporter.svg)](https://badge.fury.io/js/cdk-codepipeline-bitbucket-build-result-reporter)
![Release](https://github.com/markusl/cdk-codepipeline-bitbucket-build-result-reporter/workflows/Release/badge.svg)

# cdk-codepipeline-bitbucket-build-result-reporter

Automatically report all CodePipeline build results to a Bitbucket server. For details, see the Bitbucket REST API documentation <https://docs.atlassian.com/bitbucket-server/rest/4.0.0/bitbucket-build-rest.html>.

## Usage

### Install

Add the library to your AWS CDK project:

```sh
npm i --save cdk-codepipeline-bitbucket-build-result-reporter
```

### Configure

Configure the Bitbucket token that is used to synchronize statuses:

`aws ssm put-parameter --name "/my/ssm/variable/BITBUCKET_UPDATE_BUILD_STATUS_TOKEN" --value "<generated-token>" --type "SecureString"`

### Use

Note: `stack` must be a CDK deployment stage so that the bundled Lambda asset will be properly deployed.

```ts
  // AWS CDK 2.0
  import { App, Stack, aws_ssm as ssm, aws_ec2 as ec2 } from 'aws-cdk-lib';

  const bitbucketAccessTokenName = '/my/ssm/variable/BITBUCKET_UPDATE_BUILD_STATUS_TOKEN';

  // In your infrastructure account, add to your stack
  new CodePipelineBitbucketBuildResultReporter(stack, 'CodePipelineBitbucketBuildResultReporter', {
    bitbucketServerAddress: 'bitbucket-server.com',
    bitbucketAccessTokenName,
    vpc: fakeVpc,
  });
```
