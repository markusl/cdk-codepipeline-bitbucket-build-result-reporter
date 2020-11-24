# API Reference

**Classes**

Name|Description
----|-----------
[CodePipelineBitbucketBuildResultReporter](#cdk-codepipeline-bitbucket-build-result-reporter-codepipelinebitbucketbuildresultreporter)|A construct for reporting CodePipeline build statuses to a BitBucket server using BitBucket REST API.


**Structs**

Name|Description
----|-----------
[CodePipelineBitbucketBuildResultReporterProps](#cdk-codepipeline-bitbucket-build-result-reporter-codepipelinebitbucketbuildresultreporterprops)|*No description*



## class CodePipelineBitbucketBuildResultReporter  <a id="cdk-codepipeline-bitbucket-build-result-reporter-codepipelinebitbucketbuildresultreporter"></a>

A construct for reporting CodePipeline build statuses to a BitBucket server using BitBucket REST API.

You need to configure SSM parameter BITBUCKET_UPDATE_BUILD_STATUS_TOKEN before using the component.

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new CodePipelineBitbucketBuildResultReporter(scope: Construct, id: string, props: CodePipelineBitbucketBuildResultReporterProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[CodePipelineBitbucketBuildResultReporterProps](#cdk-codepipeline-bitbucket-build-result-reporter-codepipelinebitbucketbuildresultreporterprops)</code>)  *No description*
  * **bitbucketServerAddress** (<code>string</code>)  The BitBucket server address. 
  * **vpc** (<code>[VpcAttributes](#aws-cdk-aws-ec2-vpcattributes)</code>)  The VPC in which to run the status reporter. 
  * **bitbucketTokenName** (<code>string</code>)  Name of the SSM parameter that contains the BitBucket access token. __*Default*__: BITBUCKET_UPDATE_BUILD_STATUS_TOKEN




## struct CodePipelineBitbucketBuildResultReporterProps  <a id="cdk-codepipeline-bitbucket-build-result-reporter-codepipelinebitbucketbuildresultreporterprops"></a>






Name | Type | Description 
-----|------|-------------
**bitbucketServerAddress** | <code>string</code> | The BitBucket server address.
**vpc** | <code>[VpcAttributes](#aws-cdk-aws-ec2-vpcattributes)</code> | The VPC in which to run the status reporter.
**bitbucketTokenName**? | <code>string</code> | Name of the SSM parameter that contains the BitBucket access token.<br/>__*Default*__: BITBUCKET_UPDATE_BUILD_STATUS_TOKEN



