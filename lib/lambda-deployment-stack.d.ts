import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
export interface LambdaStackProps extends cdk.StackProps {
    readonly lambdaCode?: lambda.CfnParametersCode;
}
export declare class LambdaDeploymentStack extends cdk.Stack {
    readonly function: lambda.IFunction;
    readonly code: lambda.CfnParametersCode;
    constructor(scope: cdk.Construct, id: string, props: LambdaStackProps);
}
