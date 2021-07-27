const {
  AwsCdkConstructLibrary,
} = require('projen');

const AWS_CDK_LATEST_RELEASE = '1.115.0';

const PROJECT_NAME = 'cdk-codepipeline-bitbucket-build-result-reporter';
const PROJECT_DESCRIPTION = 'A JSII construct lib for reporting AWS CodePipeline build statuses to a Bitbucket server instance';

const project = new AwsCdkConstructLibrary({
  name: PROJECT_NAME,
  description: PROJECT_DESCRIPTION,
  authorName: 'Markus',
  authorEmail: 'markus.lindqvist@iki.fi',
  stability: 'stable',
  repository: 'https://github.com/markusl/cdk-codepipeline-bitbucket-build-result-reporter.git',
  cdkVersion: AWS_CDK_LATEST_RELEASE,
  defaultReleaseBranch: 'master',
  tsconfig: {
    compilerOptions: {
      lib: ['ES2019'],
    },
  },
  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-nodejs',
  ],
  devDeps: [
    '@types/aws-lambda@^8.10.76',
    '@types/node-fetch@^2.5.10',
    'esbuild@0.12.16',
  ],
  deps: [
    'aws-sdk@2.918.0',
    'aws-lambda@^1.0.6',
    'node-fetch@^2.6.1',
  ],
  bundledDeps: [
    'aws-sdk',
    'aws-lambda',
    'node-fetch',
  ],
});

const common_exclude = [
  '.cdk.staging',
  'cdk.context.json',
  'cdk.out',
  'coverage',
  'doc',
];
project.gitignore.exclude(...common_exclude);
project.npmignore.exclude(...common_exclude);
project.synth();
