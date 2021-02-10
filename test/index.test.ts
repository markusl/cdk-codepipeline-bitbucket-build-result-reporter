import { Capture } from '@aws-cdk/assert';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import { CodePipelineBitbucketBuildResultReporter } from '../src/index';
import '@aws-cdk/assert/jest';

test('Create CodePipelineBitbucketBuildResultReporter', () => {
  const mockApp = new cdk.App();
  const stack = new cdk.Stack(mockApp, 'testing-stack');

  const fakeVpc: ec2.VpcAttributes = {
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

  const someValue = Capture.anyType();
  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Code: {
      S3Bucket: {
        Ref: someValue.capture(),
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
                      Ref: someValue.capture(),
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
                      Ref: someValue.capture(),
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
        'CodePipelineStatusHandlerServiceRole49C6622A',
        'Arn',
      ],
    },
    Runtime: 'nodejs14.x',
    Description: 'Synchronize CodePipeline build statuses to BitBucket',
    MemorySize: 256,
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
            'CodePipelineStatusHandlerSecurityGroup7B4F49AA',
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

  expect(stack).toHaveResource('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: [
        {
          Action: 'ssm:GetParameter',
          Effect: 'Allow',
          Resource: 'arn:aws:ssm:*:*:parameter//my/ssm/variable/BITBUCKET_UPDATE_BUILD_STATUS_TOKEN',
        },
        {
          Action: [
            'codepipeline:GetPipelineExecution',
            'codepipeline:GetPipelineState',
          ],
          Effect: 'Allow',
          Resource: 'arn:aws:codepipeline:*:*:*',
        },
      ],
      Version: '2012-10-17',
    },
    PolicyName: 'CodePipelineStatusHandlerServiceRoleDefaultPolicy8241AF3D',
    Roles: [
      {
        Ref: 'CodePipelineStatusHandlerServiceRole49C6622A',
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
          'STARTED',
          'SUCCEEDED',
          'FAILED',
          'CANCELED',
        ],
      },
    },
    State: 'ENABLED',
    Targets: [
      {
        Arn: {
          'Fn::GetAtt': [
            'CodePipelineStatusHandlerA91EA00A',
            'Arn',
          ],
        },
        Id: 'Target0',
      },
    ],
  });

  expect(stack).toHaveResource('AWS::Events::Rule', {
    EventPattern: {
      'detail-type': [
        'CodeBuild Build State Change',
      ],
      'source': [
        'aws.codebuild',
      ],
      'detail': {
        'build-status': [
          'IN_PROGRESS',
          'SUCCEEDED',
          'FAILED',
          'STOPPED',
        ],
      },
    },
    State: 'ENABLED',
    Targets: [
      {
        Arn: {
          'Fn::GetAtt': [
            'CodeBuildStatusHandlerE1754F65',
            'Arn',
          ],
        },
        Id: 'Target0',
      },
    ],
  });
});
