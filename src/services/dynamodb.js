import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { GetIdCommand, GetCredentialsForIdentityCommand } from '@aws-sdk/client-cognito-identity';
import { awsConfig } from '../aws-config';

let dynamoDbClient = null;

// DynamoDB Client mit Cognito Credentials initialisieren
export const initializeDynamoDbClient = async (idToken) => {
  try {
    const cognitoIdentityClient = new CognitoIdentityClient({
      region: awsConfig.region,
    });

    // Identity ID abrufen
    const getIdCommand = new GetIdCommand({
      IdentityPoolId: awsConfig.identityPoolId,
      Logins: {
        [`cognito-idp.${awsConfig.region}.amazonaws.com/${awsConfig.userPoolId}`]: idToken,
      },
    });

    const identityResponse = await cognitoIdentityClient.send(getIdCommand);

    // Temporäre Credentials abrufen
    const getCredentialsCommand = new GetCredentialsForIdentityCommand({
      IdentityId: identityResponse.IdentityId,
      Logins: {
        [`cognito-idp.${awsConfig.region}.amazonaws.com/${awsConfig.userPoolId}`]: idToken,
      },
    });

    const credentialsResponse = await cognitoIdentityClient.send(getCredentialsCommand);

    // DynamoDB Client mit temporären Credentials erstellen
    const client = new DynamoDBClient({
      region: awsConfig.region,
      credentials: {
        accessKeyId: credentialsResponse.Credentials.AccessKeyId,
        secretAccessKey: credentialsResponse.Credentials.SecretKey,
        sessionToken: credentialsResponse.Credentials.SessionToken,
      },
    });

    dynamoDbClient = DynamoDBDocumentClient.from(client);
    return { success: true, identityId: identityResponse.IdentityId };
  } catch (error) {
    console.error('Error initializing DynamoDB client:', error);
    return { success: false, error };
  }
};

export const dynamoDbService = {
  // Key-Value Paar speichern
  putItem: async (userId, key, value) => {
    if (!dynamoDbClient) {
      throw new Error('DynamoDB client not initialized');
    }

    const command = new PutCommand({
      TableName: awsConfig.dynamoDbTableName,
      Item: {
        userId,
        key,
        value,
        timestamp: new Date().toISOString(),
      },
    });

    try {
      await dynamoDbClient.send(command);
      return { success: true };
    } catch (error) {
      console.error('Error putting item:', error);
      throw error;
    }
  },

  // Einzelnes Key-Value Paar abrufen
  getItem: async (userId, key) => {
    if (!dynamoDbClient) {
      throw new Error('DynamoDB client not initialized');
    }

    const command = new GetCommand({
      TableName: awsConfig.dynamoDbTableName,
      Key: {
        userId,
        key,
      },
    });

    try {
      const response = await dynamoDbClient.send(command);
      return response.Item || null;
    } catch (error) {
      console.error('Error getting item:', error);
      throw error;
    }
  },

  // Alle Key-Value Paare eines Benutzers abrufen
  getUserItems: async (userId) => {
    if (!dynamoDbClient) {
      throw new Error('DynamoDB client not initialized');
    }

    const command = new QueryCommand({
      TableName: awsConfig.dynamoDbTableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });

    try {
      const response = await dynamoDbClient.send(command);
      return response.Items || [];
    } catch (error) {
      console.error('Error querying items:', error);
      throw error;
    }
  },

  // Key-Value Paar löschen
  deleteItem: async (userId, key) => {
    if (!dynamoDbClient) {
      throw new Error('DynamoDB client not initialized');
    }

    const command = new DeleteCommand({
      TableName: awsConfig.dynamoDbTableName,
      Key: {
        userId,
        key,
      },
    });

    try {
      await dynamoDbClient.send(command);
      return { success: true };
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },
};
