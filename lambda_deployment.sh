# DEPRECATED. We use CDK in this house, now! Left around for posterity
cd lambda-1
rm lambda.zip
zip -r lambda.zip index.js
echo "/-------------------------"
echo "|UPLOADING TO LAMBDA LAND|"
echo "-------------------------/"
aws lambda update-function-code --function-name DevApplicationDeploymentStack-LambdaD247545B-R5SFLQFMASH6 --zip-file fileb://./lambda.zip
