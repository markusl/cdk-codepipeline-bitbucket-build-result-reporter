const {
  AwsCdkConstructLibrary,
  Semver,
} = require('projen');

const AWS_CDK_LATEST_RELEASE = '1.68.0';

const PROJECT_NAME = 'cdk-codepipeline-bitbucket-build-result-reporter';
const PROJECT_DESCRIPTION = 'A JSII construct lib for reporting AWS CodePipeline build statuses to a Bitbucket server instance';

const project = new AwsCdkConstructLibrary({
  name: PROJECT_NAME,
  description: PROJECT_DESCRIPTION,
  'authorName': 'Markus',
  'authorEmail': 'markus.lindqvist@iki.fi',
  'repository': 'https://github.com/markusl/cdk-codepipeline-bitbucket-build-result-reporter.git',
  cdkVersion: AWS_CDK_LATEST_RELEASE,
  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-nodejs',
  ],
  devDependencies: {
    '@aws-cdk/assert': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@types/aws-lambda': Semver.caret('8.10.61'),
    '@types/jest': Semver.caret('26.0.12'),
    '@types/node': Semver.caret('14.6.2'),
    '@types/node-fetch': Semver.caret('2.5.7'),
    'parcel': Semver.pinned('2.0.0-beta.1'),
  },
  dependencies: {
    'aws-sdk': Semver.caret('2.734.0'),
    'aws-lambda': Semver.caret('1.0.6'),
    'node-fetch': Semver.caret('2.6.1'),
  },
  bundledDependencies: [
    'aws-sdk',
    'aws-lambda',
    'node-fetch'
  ],
});

project.gitignore.exclude(
  '.cdk.staging',
  'cdk.context.json',
  'cdk.out',
  '.parcel-cache',
  'package.json'
);

project.npmignore.exclude(
  '.cdk.staging',
  'cdk.context.json',
  'cdk.out',
  '.parcel-cache',
  'coverage',
  'doc'
);

project.synth();
