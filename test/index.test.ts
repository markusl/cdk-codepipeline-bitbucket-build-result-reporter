import { App, Stack } from '@aws-cdk/core';
import { CodePipelineBitbucketBuildResultReporter } from '../src/index';
import '@aws-cdk/assert/jest';

test('Create CodePipelineBitbucketBuildResultReporter', () => {
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

  new CodePipelineBitbucketBuildResultReporter(stack, 'CodePipelineBitbucketBuildResultReporter', {
    bitbucketServerAddress: 'bitbucket-server.com',
    bitbucketTokenName: '/my/ssm/variable/BITBUCKET_UPDATE_BUILD_STATUS_TOKEN',
    vpc: fakeVpc,
  });

  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Code: {
      S3Bucket: {
        Ref: 'AssetParametersc4e6a78c28879650741f992ec72fd97d8e425223172f1936670c4f470e1276cfS3Bucket64216257',
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
                      Ref: 'AssetParametersc4e6a78c28879650741f992ec72fd97d8e425223172f1936670c4f470e1276cfS3VersionKeyAC3C3664',
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
                      Ref: 'AssetParametersc4e6a78c28879650741f992ec72fd97d8e425223172f1936670c4f470e1276cfS3VersionKeyAC3C3664',
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
