const {
  AwsCdkConstructLibrary,
} = require('projen');

const AWS_CDK_LATEST_RELEASE = '2.0.0-rc.23';

const PROJECT_NAME = 'cdk-codepipeline-bitbucket-build-result-reporter';
const PROJECT_DESCRIPTION = 'A JSII construct lib for reporting AWS CodePipeline and build statuses to a Bitbucket server instance';

const project = new AwsCdkConstructLibrary({
  name: PROJECT_NAME,
  description: PROJECT_DESCRIPTION,
  authorName: 'Markus Lindqvist',
  authorEmail: 'markus.lindqvist@iki.fi',
  stability: 'stable',
  repository: 'https://github.com/markusl/cdk-codepipeline-bitbucket-build-result-reporter.git',
  cdkVersion: AWS_CDK_LATEST_RELEASE,
  defaultReleaseBranch: 'master',
  minNodeVersion: '14.15.0',
  tsconfig: {
    compilerOptions: {
      lib: ['ES2020', 'DOM'],
    },
  },
  cdkDependencies: [
    'aws-cdk-lib',
  ],
  devDeps: [
    '@types/aws-lambda',
    '@types/node-fetch',
    'aws-sdk-client-mock',
    'esbuild',
    'constructs@10.0.5',
  ],
  bundledDeps: [
    '@aws-sdk/client-iam',
    '@aws-sdk/client-ssm',
    '@aws-sdk/client-s3',
    '@aws-sdk/client-codebuild',
    '@aws-sdk/client-codepipeline',
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
