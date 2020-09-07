[![NPM version](https://badge.fury.io/js/cdk-codepipeline-bitbucket-build-result-reporter.svg)](https://badge.fury.io/js/cdk-codepipeline-bitbucket-build-result-reporter)
![Release](https://github.com/markusl/cdk-codepipeline-bitbucket-build-result-reporter/workflows/Release/badge.svg)

# cdk-codepipeline-bitbucket-build-result-reporter

Automatically report all CodePipeline build results to a Bitbucket server. For details, see the Bitbucket REST API documentation <https://docs.atlassian.com/bitbucket-server/rest/4.0.0/bitbucket-build-rest.html>.

## Usage

```sh
npm i --save cdk-codepipeline-bitbucket-build-result-reporter
```

```ts
  // In your infrastructure account, add to your stack
  new CodePipelineBitBucketBuildResultReporter(stack, 'CodePipelineBitBucketBuildResultReporter', {
    bitBucketServerAddress: 'bitbucket-server.com',
    bitBucketTokenName: '/my/ssm/variable/BITBUCKET_UPDATE_BUILD_STATUS_TOKEN',
    vpc: fakeVpc,
  });
```
