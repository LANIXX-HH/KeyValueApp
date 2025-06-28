# Serverless Key-Value Store App

Eine vollständig serverlose Webanwendung mit AWS Cognito-Authentifizierung und DynamoDB-Speicherung, erstellt mit React und Amazon Cloudscape Design System.

## Features

- 🔐 **Benutzerauthentifizierung** mit AWS Cognito
- 📊 **Key-Value Datenspeicherung** in DynamoDB
- 🎨 **Amazon UI Design** mit Cloudscape Design System
- ⚡ **Serverless Architektur** - keine Server zu verwalten
- 🔒 **Sichere Datentrennung** - jeder Benutzer sieht nur seine eigenen Daten

## Schnellstart

### 🚀 Automatisches Deployment (Empfohlen)

```bash
# Repository klonen
git clone <repository-url>
cd cognito-keyvalue-app-v2
npm install

# AWS-Infrastruktur deployen + .env automatisch erstellen
cd infrastructure
npm install
npx cdk bootstrap  # Einmalig pro AWS Account
cd ..
npm run deploy:full  # Deployment + automatische .env Erstellung

# App starten
npm run dev
```

### Automatische .env-Konfiguration

Das `npm run deploy:full` Script macht automatisch:
1. CDK Stack deployment (`npm run deploy`)
2. .env-Datei aus CDK Outputs erstellen (`npm run update-env`)

Die .env-Datei wird automatisch mit allen nötigen Werten erstellt:
- AWS Region (automatisch erkannt)
- AWS Account ID (automatisch abgerufen)
- Cognito User Pool ID & Client ID
- Identity Pool ID
- DynamoDB Table Name

### Manuelle .env-Konfiguration (falls nötig)

Falls das automatische Setup nicht funktioniert:

```bash
# .env-Template kopieren
cp .env.example .env

# Nur .env aktualisieren (wenn Stack bereits existiert)
npm run update-env

# Oder manuell bearbeiten
nano .env
```

**AWS Account ID manuell herausfinden:**
```bash
aws sts get-caller-identity --query Account --output text
```

## Verwendung

### 1. Registrierung
- Neue Benutzer registrieren sich mit E-Mail und Passwort
- E-Mail-Bestätigung erforderlich (6-stelliger Code)
- Passwort-Anforderungen: 8+ Zeichen, Groß-/Kleinbuchstaben, Zahlen

### 2. Anmeldung
- Anmeldung mit bestätigter E-Mail und Passwort
- Automatische Session-Verwaltung

### 3. Key-Value Management
- **Hinzufügen**: Neue Key-Value Paare erstellen
- **Bearbeiten**: Bestehende Werte ändern
- **Löschen**: Einträge sicher entfernen
- **Anzeigen**: Alle eigenen Einträge in sortierter Tabelle

## Verfügbare Scripts

```bash
npm run dev          # Development-Server starten
npm run build        # Production-Build erstellen
npm run deploy       # CDK-Infrastruktur deployen
npm run setup        # Policies generieren
```

## Architektur

- **Frontend**: React mit Vite
- **UI**: Amazon Cloudscape Design System
- **Auth**: AWS Cognito (User Pools + Identity Pools)
- **Database**: Amazon DynamoDB
- **Infrastructure**: AWS CDK

## Deployment-Optionen

### 1. AWS Amplify (Empfohlen)
```bash
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

### 2. S3 + CloudFront
```bash
npm run build
# Upload dist/ zu S3 und CloudFront konfigurieren
```

Siehe `DEPLOYMENT_CDK.md` für detaillierte Deployment-Anweisungen.

## Sicherheit

- **Datentrennung**: Benutzer sehen nur ihre eigenen Daten
- **IAM-Policies**: Restriktive Berechtigungen
- **JWT-Token**: Sichere Authentifizierung
- **HTTPS**: Sichere Datenübertragung

## Kosten

- **Cognito**: Kostenlos für erste 50.000 MAU
- **DynamoDB**: Pay-per-Request (sehr günstig)
- **Development**: ~$0-5/Monat

## Troubleshooting

### Häufige Probleme

1. **Umgebungsvariablen nicht geladen**
   - `.env` im Root-Verzeichnis?
   - Variablen mit `VITE_` Prefix?
   - Dev-Server nach Änderungen neu starten

2. **DynamoDB-Zugriff verweigert**
   - CDK-Stack neu deployen: `cd infrastructure && npx cdk deploy`
   - IAM-Policies wurden automatisch korrigiert

3. **E-Mail-Bestätigung schlägt fehl**
   - Spam-Ordner prüfen
   - Code exakt kopieren (keine Leerzeichen)
   - Code ist 24h gültig

### Debug-Modus

Öffne Browser-Entwicklertools (F12) → Konsole für detaillierte Logs aller Operationen.

## Support

- **Debug-Logs**: Browser-Konsole (F12)
- **AWS-Status**: https://status.aws.amazon.com
- **Dokumentation**: `DEPLOYMENT_CDK.md` für detaillierte Anweisungen

## Lizenz

MIT License
