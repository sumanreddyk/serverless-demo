import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as apiGateway from '@aws-cdk/aws-apigateway';
import * as path from 'path';

export interface LambdaStackProps extends cdk.StackProps {
  readonly lambdaCode?: lambda.CfnParametersCode;
}

export class LambdaDeploymentStack extends cdk.Stack {
  public readonly function: lambda.IFunction;
  public readonly code: lambda.CfnParametersCode

  constructor(scope: cdk.Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const currentDate = new Date().toISOString();
    this.code = lambda.Code.fromCfnParameters();
    /*this.code = lambda.Code.fromCfnParameters({
      bucketNameParam: new cdk.CfnParameter(this, 'lambda-versioning-bucket'),
      objectKeyParam: new cdk.CfnParameter(this, 'CodeBucketObjectKey'),
    })*/

     const  table = new dynamodb.Table(this, 'AutoSmogStore', {
      partitionKey: { type: dynamodb.AttributeType.STRING, name: 'hash' },
      sortKey: { type: dynamodb.AttributeType.NUMBER, name: 'createdAt' }
    })

    const lambda_function = new lambda.Function(this, 'Lambda', {
      code: this.code,
      //code: lambda.Code.fromAsset('./lambda/lambda.zip'),
      //handler: 'index.handler',
      handler: 'com.evertecinc.ebus.service.function.EBUSPost::handleRequest',
      runtime: lambda.Runtime.NODEJS_10_X,
      description: `Function generated on: ${currentDate}`,
      environment: {
        TABLE_NAME: table.tableName,
      }
    });
    this.function = lambda_function;

    const version = lambda_function.addVersion(currentDate);
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: 'Prod',
      version,
    });

    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });

    //APIGateway
    const api = new apiGateway.RestApi(this, 'AutoSmogAPI', {
      restApiName: 'Auto Smog Service for ',
      description: 'CDK-powered form POST handler.'
    })

    const postIntegration = new apiGateway.LambdaIntegration(lambda_function, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    })

    api.root.addMethod('POST', postIntegration)
    table.grantWriteData(lambda_function)

    new cdk.CfnOutput(this, "parsePredictionsclicmd", {
      description: "parsePredictionsclicmd",
      exportName: "bucketName",
      value:lambda_function.functionName
    });
  }
}