"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaDeploymentStack = void 0;
const cdk = require("@aws-cdk/core");
const lambda = require("@aws-cdk/aws-lambda");
const codedeploy = require("@aws-cdk/aws-codedeploy");
const dynamodb = require("@aws-cdk/aws-dynamodb");
const apiGateway = require("@aws-cdk/aws-apigateway");
class LambdaDeploymentStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const currentDate = new Date().toISOString();
        this.code = lambda.Code.fromCfnParameters();
        /*this.code = lambda.Code.fromCfnParameters({
          bucketNameParam: new cdk.CfnParameter(this, 'lambda-versioning-bucket'),
          objectKeyParam: new cdk.CfnParameter(this, 'CodeBucketObjectKey'),
        })*/
        const table = new dynamodb.Table(this, 'AutoSmogStore', {
            partitionKey: { type: dynamodb.AttributeType.STRING, name: 'hash' },
            sortKey: { type: dynamodb.AttributeType.NUMBER, name: 'createdAt' }
        });
        const lambda_function = new lambda.Function(this, 'Lambda', {
            code: this.code,
            //code: lambda.Code.fromAsset('./lambda/lambda.zip'),
            handler: '../lambda/index.handler',
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
        });
        const postIntegration = new apiGateway.LambdaIntegration(lambda_function, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
        });
        api.root.addMethod('POST', postIntegration);
        table.grantWriteData(lambda_function);
        new cdk.CfnOutput(this, "parsePredictionsclicmd", {
            description: "parsePredictionsclicmd",
            exportName: "bucketName",
            value: lambda_function.functionName
        });
    }
}
exports.LambdaDeploymentStack = LambdaDeploymentStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLWRlcGxveW1lbnQtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsYW1iZGEtZGVwbG95bWVudC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBcUM7QUFDckMsOENBQThDO0FBQzlDLHNEQUFzRDtBQUN0RCxrREFBa0Q7QUFDbEQsc0RBQXNEO0FBT3RELE1BQWEscUJBQXNCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJbEQsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUF1QjtRQUNuRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLFdBQVcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzVDOzs7WUFHSTtRQUVILE1BQU8sS0FBSyxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ3hELFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO1lBQ25FLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO1NBQ3BFLENBQUMsQ0FBQTtRQUVGLE1BQU0sZUFBZSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQzFELElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLHFEQUFxRDtZQUNyRCxPQUFPLEVBQUUseUJBQXlCO1lBQ2xDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsV0FBVyxFQUFFLDBCQUEwQixXQUFXLEVBQUU7WUFDcEQsV0FBVyxFQUFFO2dCQUNYLFVBQVUsRUFBRSxLQUFLLENBQUMsU0FBUzthQUM1QjtTQUNGLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxRQUFRLEdBQUcsZUFBZSxDQUFDO1FBRWhDLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDeEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDbEQsU0FBUyxFQUFFLE1BQU07WUFDakIsT0FBTztTQUNSLENBQUMsQ0FBQztRQUVILElBQUksVUFBVSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUM1RCxLQUFLO1lBQ0wsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLHNCQUFzQixDQUFDLDhCQUE4QjtTQUNuRixDQUFDLENBQUM7UUFFSCxZQUFZO1FBQ1osTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDdEQsV0FBVyxFQUFFLHdCQUF3QjtZQUNyQyxXQUFXLEVBQUUsZ0NBQWdDO1NBQzlDLENBQUMsQ0FBQTtRQUVGLE1BQU0sZUFBZSxHQUFHLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRTtZQUN4RSxnQkFBZ0IsRUFBRSxFQUFFLGtCQUFrQixFQUFFLHlCQUF5QixFQUFFO1NBQ3BFLENBQUMsQ0FBQTtRQUVGLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQTtRQUMzQyxLQUFLLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFBO1FBRXJDLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDaEQsV0FBVyxFQUFFLHdCQUF3QjtZQUNyQyxVQUFVLEVBQUUsWUFBWTtZQUN4QixLQUFLLEVBQUMsZUFBZSxDQUFDLFlBQVk7U0FDbkMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBN0RELHNEQTZEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdAYXdzLWNkay9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGNvZGVkZXBsb3kgZnJvbSAnQGF3cy1jZGsvYXdzLWNvZGVkZXBsb3knO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnQGF3cy1jZGsvYXdzLWR5bmFtb2RiJztcbmltcG9ydCAqIGFzIGFwaUdhdGV3YXkgZnJvbSAnQGF3cy1jZGsvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGludGVyZmFjZSBMYW1iZGFTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICByZWFkb25seSBsYW1iZGFDb2RlPzogbGFtYmRhLkNmblBhcmFtZXRlcnNDb2RlO1xufVxuXG5leHBvcnQgY2xhc3MgTGFtYmRhRGVwbG95bWVudFN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IGZ1bmN0aW9uOiBsYW1iZGEuSUZ1bmN0aW9uO1xuICBwdWJsaWMgcmVhZG9ubHkgY29kZTogbGFtYmRhLkNmblBhcmFtZXRlcnNDb2RlXG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBMYW1iZGFTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBjdXJyZW50RGF0ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICB0aGlzLmNvZGUgPSBsYW1iZGEuQ29kZS5mcm9tQ2ZuUGFyYW1ldGVycygpO1xuICAgIC8qdGhpcy5jb2RlID0gbGFtYmRhLkNvZGUuZnJvbUNmblBhcmFtZXRlcnMoe1xuICAgICAgYnVja2V0TmFtZVBhcmFtOiBuZXcgY2RrLkNmblBhcmFtZXRlcih0aGlzLCAnbGFtYmRhLXZlcnNpb25pbmctYnVja2V0JyksXG4gICAgICBvYmplY3RLZXlQYXJhbTogbmV3IGNkay5DZm5QYXJhbWV0ZXIodGhpcywgJ0NvZGVCdWNrZXRPYmplY3RLZXknKSxcbiAgICB9KSovXG5cbiAgICAgY29uc3QgIHRhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdBdXRvU21vZ1N0b3JlJywge1xuICAgICAgcGFydGl0aW9uS2V5OiB7IHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HLCBuYW1lOiAnaGFzaCcgfSxcbiAgICAgIHNvcnRLZXk6IHsgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5OVU1CRVIsIG5hbWU6ICdjcmVhdGVkQXQnIH1cbiAgICB9KVxuXG4gICAgY29uc3QgbGFtYmRhX2Z1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnTGFtYmRhJywge1xuICAgICAgY29kZTogdGhpcy5jb2RlLFxuICAgICAgLy9jb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4vbGFtYmRhL2xhbWJkYS56aXAnKSxcbiAgICAgIGhhbmRsZXI6ICcuLi9sYW1iZGEvaW5kZXguaGFuZGxlcicsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTBfWCxcbiAgICAgIGRlc2NyaXB0aW9uOiBgRnVuY3Rpb24gZ2VuZXJhdGVkIG9uOiAke2N1cnJlbnREYXRlfWAsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBUQUJMRV9OQU1FOiB0YWJsZS50YWJsZU5hbWUsXG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5mdW5jdGlvbiA9IGxhbWJkYV9mdW5jdGlvbjtcblxuICAgIGNvbnN0IHZlcnNpb24gPSBsYW1iZGFfZnVuY3Rpb24uYWRkVmVyc2lvbihjdXJyZW50RGF0ZSk7XG4gICAgY29uc3QgYWxpYXMgPSBuZXcgbGFtYmRhLkFsaWFzKHRoaXMsICdMYW1iZGFBbGlhcycsIHtcbiAgICAgIGFsaWFzTmFtZTogJ1Byb2QnLFxuICAgICAgdmVyc2lvbixcbiAgICB9KTtcblxuICAgIG5ldyBjb2RlZGVwbG95LkxhbWJkYURlcGxveW1lbnRHcm91cCh0aGlzLCAnRGVwbG95bWVudEdyb3VwJywge1xuICAgICAgYWxpYXMsXG4gICAgICBkZXBsb3ltZW50Q29uZmlnOiBjb2RlZGVwbG95LkxhbWJkYURlcGxveW1lbnRDb25maWcuTElORUFSXzEwUEVSQ0VOVF9FVkVSWV8xTUlOVVRFLFxuICAgIH0pO1xuXG4gICAgLy9BUElHYXRld2F5XG4gICAgY29uc3QgYXBpID0gbmV3IGFwaUdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnQXV0b1Ntb2dBUEknLCB7XG4gICAgICByZXN0QXBpTmFtZTogJ0F1dG8gU21vZyBTZXJ2aWNlIGZvciAnLFxuICAgICAgZGVzY3JpcHRpb246ICdDREstcG93ZXJlZCBmb3JtIFBPU1QgaGFuZGxlci4nXG4gICAgfSlcblxuICAgIGNvbnN0IHBvc3RJbnRlZ3JhdGlvbiA9IG5ldyBhcGlHYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGxhbWJkYV9mdW5jdGlvbiwge1xuICAgICAgcmVxdWVzdFRlbXBsYXRlczogeyAnYXBwbGljYXRpb24vanNvbic6ICd7IFwic3RhdHVzQ29kZVwiOiBcIjIwMFwiIH0nIH1cbiAgICB9KVxuXG4gICAgYXBpLnJvb3QuYWRkTWV0aG9kKCdQT1NUJywgcG9zdEludGVncmF0aW9uKVxuICAgIHRhYmxlLmdyYW50V3JpdGVEYXRhKGxhbWJkYV9mdW5jdGlvbilcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwicGFyc2VQcmVkaWN0aW9uc2NsaWNtZFwiLCB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJwYXJzZVByZWRpY3Rpb25zY2xpY21kXCIsXG4gICAgICBleHBvcnROYW1lOiBcImJ1Y2tldE5hbWVcIixcbiAgICAgIHZhbHVlOmxhbWJkYV9mdW5jdGlvbi5mdW5jdGlvbk5hbWVcbiAgICB9KTtcbiAgfVxufSJdfQ==