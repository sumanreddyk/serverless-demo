#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { LambdaDeploymentStack } from '../lib/lambda-deployment-stack';

const app = new cdk.App();
const cfnParametersCode = lambda.Code.fromCfnParameters();
new LambdaDeploymentStack(app, 'LambdaDeploymentStackApplication',{
    lambdaCode: cfnParametersCode
});
