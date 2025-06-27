#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function updateEnvFile() {
  try {
    console.log('🔄 Lade CDK Stack Outputs...');
    
    // CDK Outputs abrufen
    const stackName = process.env.CDK_STACK_NAME || 'CognitoKeyValueAppStack';
    const outputsJson = execSync(`npx cdk list --json`, { encoding: 'utf8' });
    const outputs = execSync(`aws cloudformation describe-stacks --stack-name ${stackName} --query "Stacks[0].Outputs" --output json`, { encoding: 'utf8' });
    
    const stackOutputs = JSON.parse(outputs);
    
    // Outputs in Key-Value Format umwandeln
    const envVars = {};
    stackOutputs.forEach(output => {
      const key = output.OutputKey;
      const value = output.OutputValue;
      
      // CDK Output Keys zu .env Variable Names mappen
      const envKeyMap = {
        'UserPoolId': 'VITE_USER_POOL_ID',
        'UserPoolClientId': 'VITE_USER_POOL_CLIENT_ID', 
        'IdentityPoolId': 'VITE_IDENTITY_POOL_ID',
        'DynamoDBTableName': 'VITE_DYNAMODB_TABLE_NAME',
        'AWSRegion': 'VITE_AWS_REGION',
        'AWSAccountId': 'VITE_AWS_ACCOUNT_ID'
      };
      
      const envKey = envKeyMap[key];
      if (envKey) {
        envVars[envKey] = value;
      }
    });
    
    // AWS Account ID hinzufügen falls nicht vorhanden
    if (!envVars.VITE_AWS_ACCOUNT_ID) {
      const accountId = execSync('aws sts get-caller-identity --query Account --output text', { encoding: 'utf8' }).trim();
      envVars.VITE_AWS_ACCOUNT_ID = accountId;
    }
    
    // .env Datei generieren
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';
    
    // Header hinzufügen
    envContent += '# AWS Configuration - Automatisch generiert von CDK\n';
    envContent += `# Generiert am: ${new Date().toISOString()}\n\n`;
    
    // Variablen hinzufügen
    Object.entries(envVars).forEach(([key, value]) => {
      envContent += `${key}=${value}\n`;
    });
    
    // .env Datei schreiben
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env Datei erfolgreich aktualisiert!');
    console.log('📍 Pfad:', envPath);
    console.log('\n📋 Generierte Variablen:');
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`   ${key}=${value}`);
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren der .env Datei:', error.message);
    process.exit(1);
  }
}

updateEnvFile();
