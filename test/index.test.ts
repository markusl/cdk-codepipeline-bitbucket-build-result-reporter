import { App, Stack, aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CodePipelineBitbucketBuildResultReporter } from '../src/index';

test('CodePipelineBitbucketBuildResultReporter produces expected template', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');

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
    bitbucketAccessTokenName: '/my/ssm/variable/BITBUCKET_UPDATE_BUILD_STATUS_TOKEN',
    vpc: fakeVpc,
  });
  expect(Template.fromStack(stack)).toMatchSnapshot();
});
