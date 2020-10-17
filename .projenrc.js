const {
  JsiiProject,
  Semver
} = require('projen');

const AWS_CDK_LATEST_RELEASE = '1.68.0';
const CONSTRUCTS_LATEST_RELEASE = '3.0.4';

const project = new JsiiProject({
  "name": "cdk-codepipeline-bitbucket-build-result-reporter",
  "authorName": "Markus",
  "authorEmail": "markus.lindqvist@iki.fi",
  "repository": "https://github.com/markusl/cdk-codepipeline-bitbucket-build-result-reporter.git",
  devDependencies: {
    '@aws-cdk/assert': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@types/aws-lambda': Semver.caret('8.10.61'),
    '@types/jest': Semver.caret('26.0.12'),
    '@types/node': Semver.caret('14.6.2'),
    '@types/node-fetch': Semver.caret('2.5.7'),
    'parcel': Semver.pinned('2.0.0-beta.1'),
  },
  dependencies: {
    constructs: Semver.pinned(CONSTRUCTS_LATEST_RELEASE),
    '@aws-cdk/core': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-ec2': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-iam': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-events': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-events-targets': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-lambda': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-lambda-nodejs': Semver.caret(AWS_CDK_LATEST_RELEASE),
    'aws-sdk': Semver.caret('2.734.0'),
    'node-fetch': Semver.caret('2.6.1'),
  },
  peerDependencies: {
    constructs: Semver.pinned(CONSTRUCTS_LATEST_RELEASE),
    '@aws-cdk/core': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-ec2': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-iam': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-events': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-events-targets': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-lambda': Semver.caret(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-lambda-nodejs': Semver.caret(AWS_CDK_LATEST_RELEASE),
  },
  bundledDependencies: [
    'aws-sdk',
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
