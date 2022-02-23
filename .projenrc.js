const {
  awscdk,
} = require('projen');

const PROJECT_NAME = 'cdk-codepipeline-bitbucket-build-result-reporter';
const PROJECT_DESCRIPTION = 'A JSII construct lib for reporting AWS CodePipeline and build statuses to a Bitbucket server instance';

const project = new awscdk.AwsCdkConstructLibrary({
  name: PROJECT_NAME,
  description: PROJECT_DESCRIPTION,
  authorName: 'Markus Lindqvist',
  authorEmail: 'markus.lindqvist@iki.fi',
  stability: 'stable',
  repository: 'https://github.com/markusl/cdk-codepipeline-bitbucket-build-result-reporter.git',
  cdkVersion: '2.13.0',
  defaultReleaseBranch: 'master',
  minNodeVersion: '14.17.0',
  tsconfig: {
    compilerOptions: {
      lib: ['ES2020', 'DOM'],
    },
  },
  devDeps: [
    '@types/aws-lambda',
    '@types/node-fetch',
    'aws-sdk-client-mock',
    'esbuild',
    'constructs',
  ],
  bundledDeps: [
    '@aws-sdk/client-iam@3.48.0',
    '@aws-sdk/client-ssm@3.48.0',
    '@aws-sdk/client-s3@3.48.0',
    '@aws-sdk/client-codebuild@3.48.0',
    '@aws-sdk/client-codepipeline@3.48.0',
    'aws-lambda',
    'node-fetch',
  ],
});

const common_exclude = [
  'cdk.context.json',
  'cdk.out',
  'coverage',
  'doc',
];
project.gitignore.exclude(...common_exclude);
project.npmignore.exclude(...common_exclude);
project.synth();
