import { CodePipelineBitBucketBuildResultReporter } from '../src/index';
import { App, Stack } from '@aws-cdk/core';
import '@aws-cdk/assert/jest';

test('Create CodePipelineBitBucketBuildResultReporter', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');

  const fakeVpc = {
    vpcId: 'vpc-12345678',
    vpcCidrBlock: '10.10.10.0/23',
    availabilityZones: ['eu-central-1a', 'eu-central-1b'],
    publicSubnetIds: ['subnet-1122', 'subnet-2233'],
    publicSubnetRouteTableIds: ['rtb-4444', 'rtb-4444'],
    privateSubnetIds: ['subnet-8888', 'subnet-9999'],
    privateSubnetRouteTableIds: ['rtb-6666', 'rtb-6666'],
  };

  new CodePipelineBitBucketBuildResultReporter(stack, 'CodePipelineBitBucketBuildResultReporter', {
    bitBucketServerAddress: 'bitbucket-server.com',
    bitBucketTokenName: '/my/ssm/variable/BITBUCKET_UPDATE_BUILD_STATUS_TOKEN',
    vpc: fakeVpc,
  });

  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Code: {
      S3Bucket: {
        Ref: 'AssetParameters4244624f2c19a67b2fec5bd5ff765031be5785ac3d403149d21f797ad4d8f3b1S3Bucket10F15ED9',
      },
      S3Key: {
        'Fn::Join': [
          '',
          [
            {
              'Fn::Select': [
                0,
                {
                  'Fn::Split': [
                    '||',
                    {
                      Ref: 'AssetParameters4244624f2c19a67b2fec5bd5ff765031be5785ac3d403149d21f797ad4d8f3b1S3VersionKeyBBEC8CD8',
                    },
                  ],
                },
              ],
            },
            {
              'Fn::Select': [
                1,
                {
                  'Fn::Split': [
                    '||',
                    {
                      Ref: 'AssetParameters4244624f2c19a67b2fec5bd5ff765031be5785ac3d403149d21f797ad4d8f3b1S3VersionKeyBBEC8CD8',
                    },
                  ],
                },
              ],
            },
          ],
        ],
      },
    },
    Handler: 'index.handler',
    Role: {
      'Fn::GetAtt': [
        'CodePipelineBuildResultHandlerServiceRole5C456193',
        'Arn',
      ],
    },
    Runtime: 'nodejs12.x',
    Description: 'Synchronize CodePipeline build statuses to BitBucket',
    Environment: {
      Variables: {
        BITBUCKET_SERVER: 'bitbucket-server.com',
        BITBUCKET_TOKEN: '/my/ssm/variable/BITBUCKET_UPDATE_BUILD_STATUS_TOKEN',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
    },
    VpcConfig: {
      SecurityGroupIds: [
        {
          'Fn::GetAtt': [
            'CodePipelineBuildResultHandlerSecurityGroup816D5547',
            'GroupId',
          ],
        },
      ],
      SubnetIds: [
        'subnet-8888',
        'subnet-9999',
      ],
    },
  });

  expect(stack).toHaveResource('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
    ManagedPolicyArns: [
      {
        'Fn::Join': [
          '',
          [
            'arn:',
            {
              Ref: 'AWS::Partition',
            },
            ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
          ],
        ],
      },
      {
        'Fn::Join': [
          '',
          [
            'arn:',
            {
              Ref: 'AWS::Partition',
            },
            ':iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole',
          ],
        ],
      },
    ],
  });

  expect(stack).toHaveResource('AWS::Events::Rule', {
    EventPattern: {
      'detail-type': [
        'CodePipeline Action Execution State Change',
      ],
      'source': [
        'aws.codepipeline',
      ],
      'detail': {
        state: [
          'FAILED',
          'SUCCEEDED',
          'CANCELED',
        ],
      },
    },
    State: 'ENABLED',
    Targets: [
      {
        Arn: {
          'Fn::GetAtt': [
            'CodePipelineBuildResultHandler1508BCAC',
            'Arn',
          ],
        },
        Id: 'Target0',
      },
    ],
  });
});
