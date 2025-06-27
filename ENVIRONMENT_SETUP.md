# 🔧 Umgebungs-Setup für AWS-Konfiguration

## Schnellstart

### 1. Umgebungsvariablen konfigurieren
```bash
# .env.example zu .env kopieren
cp .env.example .env

# .env mit deinen AWS-Werten bearbeiten
nano .env
```

### 2. Dependencies installieren und Setup ausführen
```bash
npm install
npm run setup
```

### 3. Development starten
```bash
npm run dev
```

## Umgebungsvariablen

### Erforderliche Variablen in `.env`:

```bash
# AWS Region
VITE_AWS_REGION=your-region

# Cognito User Pool
VITE_USER_POOL_ID=your-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-client-id

# Cognito Identity Pool
VITE_IDENTITY_POOL_ID=your-identity-pool-id

# DynamoDB
VITE_DYNAMODB_TABLE_NAME=KeyValueStore

# AWS Account ID (für IAM Policies)
VITE_AWS_ACCOUNT_ID=your-account-id
```

## Verschiedene Umgebungen

### Development (.env)
```bash
# Lokale Entwicklung
VITE_AWS_REGION=your-dev-region
VITE_USER_POOL_ID=your-dev-user-pool-id
# ... weitere Dev-Werte
```

### Production (.env.production)
```bash
# Produktionsumgebung
VITE_AWS_REGION=your-prod-region
VITE_USER_POOL_ID=your-prod-user-pool-id
# ... weitere Prod-Werte
```

### Staging (.env.staging)
```bash
# Staging-Umgebung
VITE_AWS_REGION=your-staging-region
VITE_USER_POOL_ID=your-staging-user-pool-id
# ... weitere Staging-Werte
```

## NPM Scripts

```bash
# Development mit .env
npm run dev

# Production Build mit .env.production
npm run build:prod

# IAM-Policies aus .env generieren
npm run generate-policies

# Komplettes Setup (Policies generieren + Info)
npm run setup
```

## Automatische IAM-Policy-Generierung

Das Script `scripts/generate-iam-policies.js` erstellt automatisch:
- `iam-policy.json` - DynamoDB-Berechtigungen
- `trust-policy.json` - IAM Role Trust Policy

**Basierend auf deinen Umgebungsvariablen!**

## Deployment

### AWS Amplify
```bash
# Umgebungsvariablen in Amplify Console setzen
amplify env add staging
amplify env checkout staging
amplify publish
```

### Manuell (S3 + CloudFront)
```bash
# Production Build
npm run build:prod

# Upload zu S3
aws s3 sync dist/ s3://your-bucket-name
```

## Troubleshooting

### Umgebungsvariablen werden nicht geladen
- Stelle sicher, dass `.env` im Root-Verzeichnis liegt
- Variablen müssen mit `VITE_` beginnen
- Restart des Dev-Servers nach Änderungen

### IAM-Policies sind veraltet
```bash
# Policies neu generieren
npm run generate-policies
```

### Debug-Modus
Im Development-Modus werden die geladenen AWS-Konfigurationen in der Browser-Konsole angezeigt.

## Sicherheit

- **Niemals** `.env` in Git committen
- **Immer** `.env.example` als Template verwenden
- **Produktions-Secrets** nur in sicheren Umgebungen setzen
- **IAM-Policies** regelmäßig überprüfen
