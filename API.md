# API Reference

**Classes**

Name|Description
----|-----------
[CodePipelineBitBucketBuildResultReporter](#cdk-codepipeline-bitbucket-build-result-reporter-codepipelinebitbucketbuildresultreporter)|A construct for reporting CodePipeline build statuses to a BitBucket server using BitBucket REST API.


**Structs**

Name|Description
----|-----------
[CodePipelineBitBucketBuildResultReporterProps](#cdk-codepipeline-bitbucket-build-result-reporter-codepipelinebitbucketbuildresultreporterprops)|*No description*



## class CodePipelineBitBucketBuildResultReporter  <a id="cdk-codepipeline-bitbucket-build-result-reporter-codepipelinebitbucketbuildresultreporter"></a>

A construct for reporting CodePipeline build statuses to a BitBucket server using BitBucket REST API.

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new CodePipelineBitBucketBuildResultReporter(scope: Construct, id: string, props: CodePipelineBitBucketBuildResultReporterProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[CodePipelineBitBucketBuildResultReporterProps](#cdk-codepipeline-bitbucket-build-result-reporter-codepipelinebitbucketbuildresultreporterprops)</code>)  *No description*
  * **bitBucketServerAddress** (<code>string</code>)  The BitBucket server address. 
  * **vpc** (<code>[VpcAttributes](#aws-cdk-aws-ec2-vpcattributes)</code>)  The VPC in which to run the status reporter. 
  * **bitBucketTokenName** (<code>string</code>)  Name of the SSM parameter that contains the BitBucket access token. __*Default*__: BITBUCKET_UPDATE_BUILD_STATUS_TOKEN




## struct CodePipelineBitBucketBuildResultReporterProps  <a id="cdk-codepipeline-bitbucket-build-result-reporter-codepipelinebitbucketbuildresultreporterprops"></a>






Name | Type | Description 
-----|------|-------------
**bitBucketServerAddress** | <code>string</code> | The BitBucket server address.
**vpc** | <code>[VpcAttributes](#aws-cdk-aws-ec2-vpcattributes)</code> | The VPC in which to run the status reporter.
**bitBucketTokenName**? | <code>string</code> | Name of the SSM parameter that contains the BitBucket access token.<br/>__*Default*__: BITBUCKET_UPDATE_BUILD_STATUS_TOKEN



