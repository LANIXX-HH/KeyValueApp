# 🚀 CDK Deployment Guide

## Automatisches AWS-Infrastruktur-Deployment mit CDK

Das Projekt enthält eine vollständige **AWS CDK (Cloud Development Kit)** Infrastruktur, die alle benötigten AWS-Ressourcen automatisch erstellt.

## Was wird erstellt?

Die CDK-Infrastruktur erstellt automatisch:

### 🔐 **Cognito Authentication**

- **User Pool** mit E-Mail-Authentifizierung
- **User Pool Client** für die Frontend-App
- **Identity Pool** für AWS-Credentials
- **IAM Role** mit DynamoDB-Berechtigungen

### 📊 **DynamoDB Database**

- **Tabelle**: `KeyValueStore`
- **Partition Key**: `userId` (String)
- **Sort Key**: `key` (String)
- **Billing**: Pay-per-Request

### 🔒 **IAM Permissions**

- **Authenticated Role** für Cognito-Benutzer
- **Restriktive Policies** - nur Zugriff auf eigene Daten
- **Automatische Verknüpfung** mit Identity Pool

## Deployment-Schritte

### 1. Voraussetzungen

~~~bash
# AWS CLI konfiguriert
aws configure

# Node.js installiert (Version 18+)
node --version

# CDK global installiert (optional)
npm install -g aws-cdk
~~~

### 2. Repository klonen

~~~bash
git clone <repository-url>
cd cognito-keyvalue-app-v2
npm install
~~~

### 3. CDK-Infrastruktur deployen

~~~bash
# In den Infrastructure-Ordner wechseln
cd infrastructure

# Dependencies installieren
npm install

# CDK Bootstrap (einmalig pro AWS Account/Region)
npx cdk bootstrap

# Stack deployen
npx cdk deploy
~~~

### 4. CDK-Outputs notieren

Nach dem Deployment zeigt CDK die erstellten Ressourcen an:

~~~bash
✅  InfrastructureStack

Outputs:
InfrastructureStack.UserPoolId = eu-central-1_XXXXXXXXX
InfrastructureStack.UserPoolClientId = xxxxxxxxxxxxxxxxxxxxxxxxxx
InfrastructureStack.IdentityPoolId = eu-central-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
InfrastructureStack.DynamoDBTableName = KeyValueStore
InfrastructureStack.Region = eu-central-1
~~~

### 5. .env-Datei konfigurieren

~~~bash
# Zurück zum Root-Verzeichnis
cd ..

# .env-Datei erstellen
cp .env.example .env

# .env mit CDK-Outputs ausfüllen
nano .env
~~~

Beispiel `.env`:

~~~bash
VITE_AWS_REGION=eu-central-1
VITE_USER_POOL_ID=eu-central-1_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_IDENTITY_POOL_ID=eu-central-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_DYNAMODB_TABLE_NAME=KeyValueStore
VITE_AWS_ACCOUNT_ID=123456789012
~~~

### 6. App starten

~~~bash
# Setup ausführen
npm run setup

# Development-Server starten
npm run dev
~~~

## CDK-Befehle

### Nützliche CDK-Kommandos

~~~bash
cd infrastructure

# CloudFormation-Template anzeigen
npx cdk synth

# Unterschiede zum deployed Stack anzeigen
npx cdk diff

# Stack aktualisieren
npx cdk deploy

# Stack löschen (⚠️ Vorsicht!)
npx cdk destroy
~~~

### Stack-Informationen

~~~bash
# Alle Stacks anzeigen
npx cdk list

# Stack-Outputs anzeigen
aws cloudformation describe-stacks \
  --stack-name InfrastructureStack \
  --query 'Stacks[0].Outputs'
~~~

## Vorteile von CDK

### ✅ **Automatisierung**

- Alle Ressourcen mit einem Befehl
- Keine manuellen Konfigurationsfehler
- Konsistente Deployments

### ✅ **Infrastructure as Code**

- Versionskontrolle für Infrastruktur
- Reproduzierbare Umgebungen
- Code-Reviews für Infrastruktur-Änderungen

### ✅ **AWS Best Practices**

- Sichere Standard-Konfigurationen
- Automatische Verknüpfungen
- Optimierte IAM-Policies

### ✅ **Einfache Updates**

- Infrastruktur-Änderungen per Code
- Automatische Rollbacks bei Fehlern
- Drift-Detection

## Troubleshooting

### CDK Bootstrap-Fehler

~~~bash
# Bootstrap für spezifische Region
npx cdk bootstrap aws://ACCOUNT-ID/REGION
~~~

### Deployment-Fehler

~~~bash
# Detaillierte Logs anzeigen
npx cdk deploy --verbose

# CloudFormation-Events prüfen
aws cloudformation describe-stack-events \
  --stack-name InfrastructureStack
~~~

### Stack löschen

~~~bash
# Alle Ressourcen löschen
npx cdk destroy

# ⚠️ Achtung: DynamoDB-Daten gehen verloren!
~~~

## Kosten

### CDK-Deployment ist kostenlos

Die CDK-Tools selbst kosten nichts - du zahlst nur für die erstellten AWS-Ressourcen:

- **Cognito**: Kostenlos für erste 50.000 MAU
- **DynamoDB**: Pay-per-Request (sehr günstig für kleine Apps)
- **IAM**: Kostenlos

### Geschätzte Kosten für kleine App

- **Development**: ~$0-5/Monat
- **Production**: Abhängig von der Nutzung

## Verschiedene Umgebungen

### Development-Stack

~~~bash
npx cdk deploy --context environment=dev
~~~

### Production-Stack

~~~bash
npx cdk deploy --context environment=prod
~~~

### Staging-Stack

~~~bash
npx cdk deploy --context environment=staging
~~~

## Fazit

**CDK ist die empfohlene Deployment-Methode** für dieses Projekt:

- ⚡ Schneller als manuelles Setup
- 🔒 Sicherer durch Best Practices
- 🔄 Einfacher zu verwalten und aktualisieren
- 📝 Dokumentiert durch Code

**Für Produktions-Deployments solltest du immer CDK verwenden!**
