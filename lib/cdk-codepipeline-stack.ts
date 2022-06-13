import { SecretValue, Stack, StackProps} from 'aws-cdk-lib';
import {Pipeline, Artifact} from 'aws-cdk-lib/aws-codepipeline';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import {CodeBuildAction, GitHubSourceAction,} from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkCodepipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const pipeline = new Pipeline(this, 'Pipeline', {
      pipelineName: 'BolajiCDKPipeline',
    });

    const sourceOutput = new Artifact("SourceOutput");

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          actionName: 'PipelineSource',
          owner: 'BigB97',
          repo: 'aws_cdk',
          branch: 'master',
          oauthToken: SecretValue.secretsManager('oauth-cdk'),
          output: sourceOutput
        }),
      ],

  });
  const buildOutput = new Artifact("buildOutput");

  pipeline.addStage({
    stageName: 'Build',
    actions: [
      new CodeBuildAction(
        {
          actionName: 'Build',
          input: sourceOutput,
          outputs: [buildOutput],
          project: new PipelineProject(this, 'PipelineProject', {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0,
            },
            buildSpec: BuildSpec.fromSourceFilename('build/buildspec.yml'),
          }),
        }
      )
    ]
  });

}}