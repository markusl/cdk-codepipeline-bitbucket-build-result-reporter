# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### CodePipelineBitbucketBuildResultReporter <a name="cdk-codepipeline-bitbucket-build-result-reporter.CodePipelineBitbucketBuildResultReporter"></a>

A CDK construct for reporting CodePipeline build statuses to a BitBucket server using BitBucket REST API.

You need to configure SSM parameter `BITBUCKET_UPDATE_BUILD_STATUS_TOKEN` before using the construct.

#### Initializers <a name="cdk-codepipeline-bitbucket-build-result-reporter.CodePipelineBitbucketBuildResultReporter.Initializer"></a>

```typescript
import { CodePipelineBitbucketBuildResultReporter } from 'cdk-codepipeline-bitbucket-build-result-reporter'

new CodePipelineBitbucketBuildResultReporter(scope: Construct, id: string, props: CodePipelineBitbucketBuildResultReporterProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-codepipeline-bitbucket-build-result-reporter.CodePipelineBitbucketBuildResultReporter.parameter.scope"></a>

- *Type:* [`constructs.Construct`](#constructs.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-codepipeline-bitbucket-build-result-reporter.CodePipelineBitbucketBuildResultReporter.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-codepipeline-bitbucket-build-result-reporter.CodePipelineBitbucketBuildResultReporter.parameter.props"></a>

- *Type:* [`cdk-codepipeline-bitbucket-build-result-reporter.CodePipelineBitbucketBuildResultReporterProps`](#cdk-codepipeline-bitbucket-build-result-reporter.CodePipelineBitbucketBuildResultReporterProps)

---





## Structs <a name="Structs"></a>

### CodePipelineBitbucketBuildResultReporterProps <a name="cdk-codepipeline-bitbucket-build-result-reporter.CodePipelineBitbucketBuildResultReporterProps"></a>

Common properties.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { CodePipelineBitbucketBuildResultReporterProps } from 'cdk-codepipeline-bitbucket-build-result-reporter'

const codePipelineBitbucketBuildResultReporterProps: CodePipelineBitbucketBuildResultReporterProps = { ... }
```

##### `bitbucketServerAddress`<sup>Required</sup> <a name="cdk-codepipeline-bitbucket-build-result-reporter.CodePipelineBitbucketBuildResultReporterProps.property.bitbucketServerAddress"></a>

- *Type:* `string`

The BitBucket server address.

---

##### `bitbucketAccessTokenName`<sup>Optional</sup> <a name="cdk-codepipeline-bitbucket-build-result-reporter.CodePipelineBitbucketBuildResultReporterProps.property.bitbucketAccessTokenName"></a>

- *Type:* `string`
- *Default:* BITBUCKET_UPDATE_BUILD_STATUS_TOKEN

The SSM parameter (SecureString) name that contains the BitBucket access token for reporting build statuses.

---

##### `vpc`<sup>Optional</sup> <a name="cdk-codepipeline-bitbucket-build-result-reporter.CodePipelineBitbucketBuildResultReporterProps.property.vpc"></a>

- *Type:* [`aws-cdk-lib.aws_ec2.VpcAttributes`](#aws-cdk-lib.aws_ec2.VpcAttributes)

The VPC in which to run the status reporter.

---



