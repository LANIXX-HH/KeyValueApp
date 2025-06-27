#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const STACK_NAME = process.env.CDK_STACK_NAME || 'CognitoKeyValueAppStack';

async function updateEnvFromCDK() {
  try {
    console.log('🔄 Lade CDK Stack Outputs...');
    
    // 1. Stack Outputs abrufen
    const outputsCmd = `aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query "Stacks[0].Outputs" --output json`;
    const outputsJson = execSync(outputsCmd, { encoding: 'utf8' });
    const outputs = JSON.parse(outputsJson);
    
    // 2. AWS Account ID und Region abrufen
    const accountId = execSync('aws sts get-caller-identity --query Account --output text', { encoding: 'utf8' }).trim();
    const region = execSync('aws configure get region', { encoding: 'utf8' }).trim() || 'eu-central-1';
    
    // 3. Outputs zu Environment Variables mappen
    const envVars = {
      VITE_AWS_REGION: region,
      VITE_AWS_ACCOUNT_ID: accountId
    };
    
    // CDK Outputs verarbeiten
    outputs.forEach(output => {
      const mapping = {
        'UserPoolId': 'VITE_USER_POOL_ID',
        'UserPoolClientId': 'VITE_USER_POOL_CLIENT_ID',
        'IdentityPoolId': 'VITE_IDENTITY_POOL_ID', 
        'DynamoDBTableName': 'VITE_DYNAMODB_TABLE_NAME'
      };
      
      const envKey = mapping[output.OutputKey];
      if (envKey) {
        envVars[envKey] = output.OutputValue;
      }
    });
    
    // 4. .env Datei generieren
    const envPath = path.join(__dirname, '../.env');
    let envContent = '';
    
    envContent += '# AWS Configuration - Automatisch generiert von CDK\n';
    envContent += `# Generiert am: ${new Date().toISOString()}\n`;
    envContent += `# Stack: ${STACK_NAME}\n\n`;
    
    // Sortierte Ausgabe für bessere Lesbarkeit
    const sortedVars = Object.entries(envVars).sort(([a], [b]) => a.localeCompare(b));
    sortedVars.forEach(([key, value]) => {
      envContent += `${key}=${value}\n`;
    });
    
    // 5. Datei schreiben
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env Datei erfolgreich aktualisiert!');
    console.log('📍 Pfad:', envPath);
    console.log('\n📋 Konfigurierte Variablen:');
    sortedVars.forEach(([key, value]) => {
      console.log(`   ${key}=${value}`);
    });
    
    console.log('\n🎯 Nächste Schritte:');
    console.log('   npm run dev');
    
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren der .env Datei:');
    console.error(error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Mögliche Lösungen:');
      console.log('   1. CDK Stack deployen: cd infrastructure && npx cdk deploy');
      console.log('   2. Stack Name prüfen:', STACK_NAME);
      console.log('   3. AWS CLI Konfiguration prüfen: aws configure list');
    }
    
    process.exit(1);
  }
}

updateEnvFromCDK();
