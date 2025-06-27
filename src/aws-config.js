// AWS Configuration aus Umgebungsvariablen
export const awsConfig = {
  region: import.meta.env.VITE_AWS_REGION,
  userPoolId: import.meta.env.VITE_USER_POOL_ID,
  userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
  dynamoDbTableName: import.meta.env.VITE_DYNAMODB_TABLE_NAME,
  accountId: import.meta.env.VITE_AWS_ACCOUNT_ID
};

// Debug-Ausgabe in Development
if (import.meta.env.DEV) {
  console.log('🔧 AWS Config loaded:', {
    region: awsConfig.region,
    userPoolId: awsConfig.userPoolId,
    identityPoolId: awsConfig.identityPoolId,
    tableName: awsConfig.dynamoDbTableName,
    accountId: awsConfig.accountId
  });
}
