# AWS Amplify Deployment

## Voraussetzungen
```bash
# Amplify CLI installieren
npm install -g @aws-amplify/cli

# AWS CLI konfigurieren
aws configure
```

## Schritt-für-Schritt Deployment

### 1. Amplify initialisieren
```bash
cd cognito-keyvalue-app-v2
amplify init
```

**Konfiguration:**
- Project name: `cognito-keyvalue-app`
- Environment name: `prod`
- Default editor: `Visual Studio Code`
- App type: `javascript`
- Framework: `react`
- Source Directory Path: `src`
- Distribution Directory Path: `dist`
- Build Command: `npm run build`
- Start Command: `npm run dev`

### 2. Hosting hinzufügen
```bash
amplify add hosting
```

**Optionen:**
- Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)
- Amazon CloudFront and S3

### 3. Deployen
```bash
# Build und Deploy
amplify publish

# Nur Frontend aktualisieren
amplify publish --yes
```

### 4. Custom Domain (Optional)
```bash
amplify add hosting
# Wähle: Amplify Console
# Folge den Anweisungen für Custom Domain
```

## Umgebungsvariablen
Erstelle `.env.production`:
```
VITE_AWS_REGION=your-region
VITE_USER_POOL_ID=your-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-client-id
VITE_IDENTITY_POOL_ID=your-identity-pool-id
VITE_DYNAMODB_TABLE_NAME=KeyValueStore
VITE_AWS_ACCOUNT_ID=your-account-id
```
