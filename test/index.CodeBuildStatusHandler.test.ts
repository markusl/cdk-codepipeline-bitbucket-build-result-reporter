import type * as AwsLambda from 'aws-lambda';
import { buildBitbucketBuildStatusBody } from '../src/index.CodeBuildStatusHandler';

const event = (status: AwsLambda.CodeBuildStateType): AwsLambda.CodeBuildCloudWatchStateEvent => ({
  'version': '0',
  'id': 'c030038d-8c4d-6141-9545-00ff7b7153EX',
  'detail-type': 'CodeBuild Build State Change',
  'source': 'aws.codebuild',
  'account': '123456789012',
  'time': '2017-09-01T16:14:28Z',
  'region': 'us-west-2',
  'resources': [
    'arn:aws:codebuild:us-west-2:123456789012:build/my-sample-project:8745a7a9-c340-456a-9166-edf953571bEX',
  ],
  'detail': {
    'build-status': status,
    'project-name': 'my-sample-project',
    'build-id': 'arn:aws:codebuild:us-west-2:123456789012:build/my-sample-project:8745a7a9-c340-456a-9166-edf953571bEX',
    'additional-information': {
      'cache': {
        type: 'NO_CACHE',
      },
      'build-number': 0,
      'source-version': 'string',
      'project-file-system-locations': [],
      'queued-timeout-in-minutes': 0,
      'artifact': {
        location: 'arn:aws:s3:::codebuild-123456789012-output-bucket/my-output-artifact.zip',
      },
      'environment': {
        'image': 'aws/codebuild/standard:4.0',
        'privileged-mode': false,
        'compute-type': 'BUILD_GENERAL1_SMALL',
        'type': 'LINUX_CONTAINER',
        'environment-variables': [],
      },
      'timeout-in-minutes': 60,
      'build-complete': true,
      'initiator': 'MyCodeBuildDemoUser',
      'build-start-time': 'Sep 1, 2017 4:12:29 PM',
      'source': {
        buildspec: '',
        location: 'codebuild-123456789012-input-bucket/my-input-artifact.zip',
        type: 'S3',
      },
      'logs': {
        'group-name': '/aws/codebuild/my-sample-project',
        'stream-name': '8745a7a9-c340-456a-9166-edf953571bEX',
        'deep-link': 'https://console.aws.amazon.com/cloudwatch/home?region=us-west-2#logEvent:group=/aws/codebuild/my-sample-project;stream=8745a7a9-c340-456a-9166-edf953571bEX',
      },
      'phases': [
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:12:29 PM',
          'end-time': 'Sep 1, 2017 4:12:29 PM',
          'duration-in-seconds': 0,
          'phase-type': 'SUBMITTED',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:12:29 PM',
          'end-time': 'Sep 1, 2017 4:13:05 PM',
          'duration-in-seconds': 36,
          'phase-type': 'PROVISIONING',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:13:05 PM',
          'end-time': 'Sep 1, 2017 4:13:10 PM',
          'duration-in-seconds': 4,
          'phase-type': 'DOWNLOAD_SOURCE',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:13:10 PM',
          'end-time': 'Sep 1, 2017 4:13:10 PM',
          'duration-in-seconds': 0,
          'phase-type': 'INSTALL',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:13:10 PM',
          'end-time': 'Sep 1, 2017 4:13:10 PM',
          'duration-in-seconds': 0,
          'phase-type': 'PRE_BUILD',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:13:10 PM',
          'end-time': 'Sep 1, 2017 4:14:21 PM',
          'duration-in-seconds': 70,
          'phase-type': 'BUILD',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:14:21 PM',
          'end-time': 'Sep 1, 2017 4:14:21 PM',
          'duration-in-seconds': 0,
          'phase-type': 'POST_BUILD',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:14:21 PM',
          'end-time': 'Sep 1, 2017 4:14:21 PM',
          'duration-in-seconds': 0,
          'phase-type': 'UPLOAD_ARTIFACTS',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:14:21 PM',
          'end-time': 'Sep 1, 2017 4:14:26 PM',
          'duration-in-seconds': 4,
          'phase-type': 'FINALIZING',
          'phase-status': 'SUCCEEDED',
        },
        {
          'start-time': 'Sep 1, 2017 4:14:26 PM',
          'phase-type': 'COMPLETED',
        },
      ],
    },
    'current-phase': 'COMPLETED',
    'current-phase-context': '[]',
    'version': '1',
  },
});

test('buildBitbucketBuildStatus InProgress', async () => {
  expect(await buildBitbucketBuildStatusBody(event('IN_PROGRESS'), 'IN_PROGRESS')).toMatchObject({
    description: 'my-sample-project build initiated by MyCodeBuildDemoUser at Sep 1, 2017 4:12:29 PM',
    key: 'my-sample-project',
    name: 'CodeBuild my-sample-project (123456789012 @ us-west-2)',
    state: 'INPROGRESS',
    url: 'https://us-west-2.console.aws.amazon.com/codesuite/codebuild/123456789012/projects/my-sample-project/build/my-sample-project:8745a7a9-c340-456a-9166-edf953571bEX/?region=us-west-2',
  });
});

test('buildBitbucketBuildStatus Succeeded', async () => {
  expect(await buildBitbucketBuildStatusBody(event('SUCCEEDED'), 'SUCCEEDED')).toMatchObject({
    description: 'my-sample-project build initiated by MyCodeBuildDemoUser at Sep 1, 2017 4:12:29 PM',
    key: 'my-sample-project',
    name: 'CodeBuild my-sample-project (123456789012 @ us-west-2)',
    state: 'SUCCESSFUL',
    url: 'https://us-west-2.console.aws.amazon.com/codesuite/codebuild/123456789012/projects/my-sample-project/build/my-sample-project:8745a7a9-c340-456a-9166-edf953571bEX/?region=us-west-2',
  });
});

test('buildBitbucketBuildStatus Failed', async () => {
  expect(await buildBitbucketBuildStatusBody(event('FAILED'), 'FAILED')).toMatchObject({
    description: 'my-sample-project build initiated by MyCodeBuildDemoUser at Sep 1, 2017 4:12:29 PM',
    key: 'my-sample-project',
    name: 'CodeBuild my-sample-project (123456789012 @ us-west-2)',
    state: 'FAILED',
    url: 'https://us-west-2.console.aws.amazon.com/codesuite/codebuild/123456789012/projects/my-sample-project/build/my-sample-project:8745a7a9-c340-456a-9166-edf953571bEX/?region=us-west-2',
  });
});
