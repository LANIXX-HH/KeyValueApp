const { Stack, CfnOutput, CustomResource } = require('aws-cdk-lib');
const { UserPool, UserPoolClient } = require('aws-cdk-lib/aws-cognito');
const { IdentityPool } = require('@aws-cdk/aws-cognito-identitypool-alpha');
const { Table, AttributeType, BillingMode } = require('aws-cdk-lib/aws-dynamodb');
const { Role, FederatedPrincipal, PolicyStatement } = require('aws-cdk-lib/aws-iam');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const fs = require('fs');
const path = require('path');

class CognitoKeyValueAppStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // 1. Cognito User Pool
    const userPool = new UserPool(this, 'KeyValueAppUserPool', {
      userPoolName: 'KeyValueApp-UserPool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
      },
    });

    // 2. User Pool Client
    const userPoolClient = new UserPoolClient(this, 'KeyValueAppUserPoolClient', {
      userPool,
      userPoolClientName: 'KeyValueApp-Client',
      generateSecret: false,
      authFlows: {
        userSrp: true,
        userPassword: true,
      },
    });

    // 3. Identity Pool
    const identityPool = new IdentityPool(this, 'KeyValueAppIdentityPool', {
      identityPoolName: 'KeyValueApp-IdentityPool',
      allowUnauthenticatedIdentities: false,
      authenticationProviders: {
        userPools: [
          {
            userPool: userPool,
            userPoolClient: userPoolClient,
          },
        ],
      },
    });

    // 4. DynamoDB Table
    const table = new Table(this, 'KeyValueStore', {
      tableName: 'KeyValueStore',
      partitionKey: {
        name: 'userId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'key',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // 5. IAM Role für authentifizierte Benutzer
    const authenticatedRole = identityPool.authenticatedRole;
    authenticatedRole.addToPolicy(
      new PolicyStatement({
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
          'dynamodb:Query',
        ],
        resources: [table.tableArn],
        conditions: {
          'ForAllValues:StringEquals': {
            'dynamodb:LeadingKeys': ['${cognito-identity.amazonaws.com:sub}'],
          },
        },
      })
    );

    // 6. Lambda für .env-Generierung
    const envGeneratorLambda = new Function(this, 'EnvGeneratorLambda', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromInline(`
        const fs = require('fs');
        const path = require('path');
        const response = require('cfn-response');
        
        exports.handler = async (event, context) => {
          console.log('Event:', JSON.stringify(event, null, 2));
          
          if (event.RequestType === 'Create' || event.RequestType === 'Update') {
            try {
              const envContent = \`# AWS Configuration - Automatisch generiert von CDK
# Generiert am: \${new Date().toISOString()}

VITE_AWS_REGION=\${event.ResourceProperties.Region}
VITE_USER_POOL_ID=\${event.ResourceProperties.UserPoolId}
VITE_USER_POOL_CLIENT_ID=\${event.ResourceProperties.UserPoolClientId}
VITE_IDENTITY_POOL_ID=\${event.ResourceProperties.IdentityPoolId}
VITE_DYNAMODB_TABLE_NAME=\${event.ResourceProperties.TableName}
VITE_AWS_ACCOUNT_ID=\${event.ResourceProperties.AccountId}
\`;
              
              console.log('Generated .env content:', envContent);
              await response.send(event, context, response.SUCCESS, { EnvContent: envContent });
            } catch (error) {
              console.error('Error:', error);
              await response.send(event, context, response.FAILED, { Error: error.message });
            }
          } else {
            await response.send(event, context, response.SUCCESS);
          }
        };
      `),
    });

    // 7. Custom Resource für .env-Generierung
    const envGenerator = new CustomResource(this, 'EnvGenerator', {
      serviceToken: envGeneratorLambda.functionArn,
      properties: {
        Region: this.region,
        UserPoolId: userPool.userPoolId,
        UserPoolClientId: userPoolClient.userPoolClientId,
        IdentityPoolId: identityPool.identityPoolId,
        TableName: table.tableName,
        AccountId: this.account,
      },
    });

    // 8. CDK Outputs
    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.identityPoolId,
      description: 'Cognito Identity Pool ID',
    });

    new CfnOutput(this, 'DynamoDBTableName', {
      value: table.tableName,
      description: 'DynamoDB Table Name',
    });

    new CfnOutput(this, 'AWSRegion', {
      value: this.region,
      description: 'AWS Region',
    });

    new CfnOutput(this, 'AWSAccountId', {
      value: this.account,
      description: 'AWS Account ID',
    });

    // 9. .env Content Output
    new CfnOutput(this, 'EnvFileContent', {
      value: envGenerator.getAttString('EnvContent'),
      description: 'Complete .env file content',
    });
  }
}

module.exports = { CognitoKeyValueAppStack };
