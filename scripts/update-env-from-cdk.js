#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STACK_NAME = process.env.CDK_STACK_NAME || 'InfrastructureStack';
const DEFAULT_REGION = process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';

async function updateEnvFromCDK() {
  try {
    console.log('🔄 Lade CDK Stack Outputs...');
    console.log('📍 Stack Name:', STACK_NAME);
    
    // 1. Region bestimmen (mit Fallback-Optionen)
    let region = DEFAULT_REGION;
    try {
      const configuredRegion = execSync('aws configure get region', { encoding: 'utf8' }).trim();
      if (configuredRegion) {
        region = configuredRegion;
      }
    } catch (error) {
      console.log('⚠️  Keine Region in AWS Config gefunden, verwende:', region);
    }
    
    console.log('🌍 Verwende Region:', region);
    
    // 2. AWS Credentials und Account ID prüfen
    let accountId;
    try {
      accountId = execSync(`aws sts get-caller-identity --region ${region} --query Account --output text`, { encoding: 'utf8' }).trim();
      console.log('🔑 AWS Account ID:', accountId);
    } catch (error) {
      throw new Error(`AWS Credentials Fehler: ${error.message}\n\nBitte prüfe:\n1. aws configure list\n2. aws sts get-caller-identity\n3. AWS Credentials sind gültig und nicht abgelaufen`);
    }
    
    // 3. Stack Outputs abrufen
    const outputsCmd = `aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${region} --query "Stacks[0].Outputs" --output json`;
    console.log('📋 Lade Stack Outputs...');
    const outputsJson = execSync(outputsCmd, { encoding: 'utf8' });
    const outputs = JSON.parse(outputsJson);
    
    // 4. Outputs zu Environment Variables mappen
    const envVars = {
      VITE_AWS_REGION: region,
      VITE_AWS_ACCOUNT_ID: accountId
    };
    
    // CDK Outputs verarbeiten
    console.log('🔄 Verarbeite CDK Outputs...');
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
        console.log(`   ✓ ${output.OutputKey} → ${envKey}`);
      }
    });
    
    // 5. .env Datei generieren
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
    
    console.log('\n✅ .env Datei erfolgreich aktualisiert!');
    console.log('📍 Pfad:', envPath);
    console.log('\n📋 Konfigurierte Variablen:');
    sortedVars.forEach(([key, value]) => {
      console.log(`   ${key}=${value}`);
    });
    
    console.log('\n🎯 Nächste Schritte:');
    console.log('   npm run dev');
    
  } catch (error) {
    console.error('\n❌ Fehler beim Aktualisieren der .env Datei:');
    console.error(error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Stack nicht gefunden - Mögliche Lösungen:');
      console.log('   1. CDK Stack deployen: cd infrastructure && npx cdk deploy');
      console.log('   2. Stack Name prüfen:', STACK_NAME);
      console.log('   3. Region prüfen:', DEFAULT_REGION);
    } else if (error.message.includes('region')) {
      console.log('\n💡 Region-Problem - Lösungen:');
      console.log('   1. Region setzen: export AWS_DEFAULT_REGION=eu-central-1');
      console.log('   2. AWS konfigurieren: aws configure');
      console.log('   3. Script mit Region: AWS_DEFAULT_REGION=eu-central-1 npm run update-env');
    } else if (error.message.includes('Credentials')) {
      console.log('\n💡 Credentials-Problem - Lösungen:');
      console.log('   1. AWS Profile prüfen: aws configure list');
      console.log('   2. Credentials erneuern: aws sso login (falls SSO)');
      console.log('   3. Neue Credentials: aws configure');
    }
    
    console.log('\n🔍 Debug-Informationen:');
    console.log('   Stack Name:', STACK_NAME);
    console.log('   Default Region:', DEFAULT_REGION);
    console.log('   AWS Profile:', process.env.AWS_PROFILE || 'default');
    
    process.exit(1);
  }
}

updateEnvFromCDK();
