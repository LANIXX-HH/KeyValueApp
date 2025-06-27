#!/usr/bin/env node

// Script zum Generieren der IAM-Policies aus Umgebungsvariablen
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { join } from 'path';

// .env laden
config();

const AWS_REGION = process.env.VITE_AWS_REGION;
const AWS_ACCOUNT_ID = process.env.VITE_AWS_ACCOUNT_ID;
const IDENTITY_POOL_ID = process.env.VITE_IDENTITY_POOL_ID;
const DYNAMODB_TABLE_NAME = process.env.VITE_DYNAMODB_TABLE_NAME || 'KeyValueStore';

// Validierung der erforderlichen Umgebungsvariablen
if (!AWS_REGION || !AWS_ACCOUNT_ID || !IDENTITY_POOL_ID) {
  console.error('❌ Fehler: Erforderliche Umgebungsvariablen fehlen!');
  console.error('Stelle sicher, dass folgende Variablen in .env gesetzt sind:');
  console.error('- VITE_AWS_REGION');
  console.error('- VITE_AWS_ACCOUNT_ID');
  console.error('- VITE_IDENTITY_POOL_ID');
  process.exit(1);
}

// IAM Policy für DynamoDB
const iamPolicy = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": `arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT_ID}:table/${DYNAMODB_TABLE_NAME}`,
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["${cognito-identity.amazonaws.com:sub}"]
        }
      }
    }
  ]
};

// Trust Policy für IAM Role
const trustPolicy = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": IDENTITY_POOL_ID
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }
    }
  ]
};

// Dateien schreiben
try {
  writeFileSync('iam-policy.json', JSON.stringify(iamPolicy, null, 2));
  writeFileSync('trust-policy.json', JSON.stringify(trustPolicy, null, 2));
  
  console.log('✅ IAM Policies generiert:');
  console.log(`   - Region: ${AWS_REGION}`);
  console.log(`   - Account ID: ${AWS_ACCOUNT_ID}`);
  console.log(`   - Identity Pool: ${IDENTITY_POOL_ID}`);
  console.log(`   - DynamoDB Table: ${DYNAMODB_TABLE_NAME}`);
  console.log('   - iam-policy.json');
  console.log('   - trust-policy.json');
} catch (error) {
  console.error('❌ Fehler beim Generieren der Policies:', error);
  process.exit(1);
}
