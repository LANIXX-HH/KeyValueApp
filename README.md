# Serverless Key-Value Store App

Eine vollständig serverlose Webanwendung mit AWS Cognito-Authentifizierung und DynamoDB-Speicherung, erstellt mit React und Amazon Cloudscape Design System.

## Features

- 🔐 **Benutzerauthentifizierung** mit AWS Cognito (User Pools + Identity Pools)
- 📊 **Key-Value Datenspeicherung** in DynamoDB mit automatischer Synchronisation
- 🎨 **Amazon UI Design** mit Cloudscape Design System
- ⚡ **Serverless Architektur** - keine Server zu verwalten
- 🔒 **Sichere Datentrennung** - jeder Benutzer sieht nur seine eigenen Daten
- 🔄 **Echtzeit-Updates** - Änderungen werden sofort gespeichert und angezeigt
- 📱 **Responsive Design** - funktioniert auf Desktop und Mobile
- 🛠️ **Debug-Modus** - Umfassende Logging-Funktionalität für Entwicklung
- 🔧 **Umgebungsbasiert** - Alle AWS-Konfigurationen über .env-Dateien

## Architektur

- **Frontend**: React mit Vite
- **UI Framework**: Amazon Cloudscape Design System
- **Authentifizierung**: AWS Cognito User Pools + Identity Pools
- **Datenbank**: Amazon DynamoDB
- **Konfiguration**: Umgebungsvariablen (.env)
- **Hosting**: AWS Amplify, S3 + CloudFront oder andere Plattformen

## Erforderliche AWS Ressourcen

Du benötigst folgende AWS-Services in deinem Account:

### 1. Cognito User Pool

- **Zweck**: Benutzerregistrierung und Anmeldung
- **Konfiguration**: E-Mail als Username, Passwort-Policy
- **Ausgabe**: User Pool ID + Client ID

### 2. Cognito Identity Pool

- **Zweck**: AWS-Credentials für Frontend
- **Konfiguration**: Verknüpfung mit User Pool
- **Ausgabe**: Identity Pool ID

### 3. DynamoDB Tabelle

- **Name**: `KeyValueStore` (oder beliebig)
- **Partition Key**: `userId` (String)
- **Sort Key**: `key` (String)
- **Billing**: Pay-per-Request

### 4. IAM Role

- **Name**: `CognitoAuthenticatedRole`
- **Zweck**: DynamoDB-Zugriff für authentifizierte Benutzer
- **Policy**: Wird automatisch generiert

## Installation und Setup

### Voraussetzungen

- Node.js (Version 18+)
- AWS CLI konfiguriert
- AWS Account mit entsprechenden Berechtigungen

### 🚀 **Option 1: Automatisches Deployment mit CDK (Empfohlen)**

Das Projekt enthält eine vollständige CDK-Infrastruktur für automatisches Deployment:

#### 1.1 Repository klonen

```bash
git clone <repository-url>
cd cognito-keyvalue-app-v2
npm install
```

#### 1.2 CDK-Infrastruktur deployen

```bash
cd infrastructure
npm install
npx cdk bootstrap  # Einmalig pro AWS Account/Region
npx cdk deploy
```

#### 1.3 CDK-Outputs in .env eintragen

Nach dem Deployment zeigt CDK die erstellten Ressourcen an:

```bash
# CDK-Outputs kopieren und in .env eintragen
cp .env.example .env
# Werte aus CDK-Output einfügen
```

#### 1.4 App starten

```bash
npm run setup
npm run dev
```

### 🔧 **Option 2: Manuelles Setup (für Lernzwecke)**

Wenn du die AWS-Ressourcen manuell erstellen möchtest:

#### 2.1 Cognito User Pool erstellen

```bash
aws cognito-idp create-user-pool \
  --pool-name "KeyValueApp-UserPool" \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true}" \
  --username-attributes email \
  --auto-verified-attributes email
```

**Notiere die `UserPoolId` aus der Antwort!**

#### 2.2 User Pool Client erstellen

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id <DEINE_USER_POOL_ID> \
  --client-name "KeyValueApp-Client" \
  --no-generate-secret
```

**Notiere die `ClientId` aus der Antwort!**

#### 2.3 Identity Pool erstellen

```bash
aws cognito-identity create-identity-pool \
  --identity-pool-name "KeyValueApp-IdentityPool" \
  --allow-unauthenticated-identities \
  --cognito-identity-providers ProviderName=cognito-idp.<REGION>.amazonaws.com/<USER_POOL_ID>,ClientId=<CLIENT_ID>
```

**Notiere die `IdentityPoolId` aus der Antwort!**

#### 2.4 DynamoDB Tabelle erstellen

```bash
aws dynamodb create-table \
  --table-name KeyValueStore \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=key,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=key,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

### Schritt 3: Umgebungsvariablen konfigurieren

#### 3.1 .env-Datei erstellen

```bash
cp .env.example .env
```

#### 3.2 .env-Datei mit deinen AWS-Werten ausfüllen

```bash
# AWS Region (wo deine Ressourcen erstellt wurden)
VITE_AWS_REGION=your-region

# Cognito User Pool (aus Schritt 2.1)
VITE_USER_POOL_ID=your-user-pool-id

# Cognito User Pool Client (aus Schritt 2.2)
VITE_USER_POOL_CLIENT_ID=your-client-id

# Cognito Identity Pool (aus Schritt 2.3)
VITE_IDENTITY_POOL_ID=your-identity-pool-id

# DynamoDB Tabelle (aus Schritt 2.4)
VITE_DYNAMODB_TABLE_NAME=KeyValueStore

# Deine AWS Account ID (findest du in der AWS Console)
VITE_AWS_ACCOUNT_ID=your-account-id
```

#### 3.3 AWS Account ID herausfinden

```bash
aws sts get-caller-identity --query Account --output text
```

### Schritt 4: IAM-Berechtigungen einrichten

#### 4.1 IAM-Policies generieren

```bash
npm run generate-policies
```

Dies erstellt automatisch:

- `iam-policy.json` - DynamoDB-Berechtigungen
- `trust-policy.json` - IAM Role Trust Policy

#### 4.2 IAM Role erstellen

```bash
# Role erstellen
aws iam create-role \
  --role-name CognitoAuthenticatedRole \
  --assume-role-policy-document file://trust-policy.json

# Policy anhängen
aws iam put-role-policy \
  --role-name CognitoAuthenticatedRole \
  --policy-name DynamoDBAccess \
  --policy-document file://iam-policy.json
```

#### 4.3 Identity Pool mit IAM Role verknüpfen

```bash
aws cognito-identity set-identity-pool-roles \
  --identity-pool-id <DEINE_IDENTITY_POOL_ID> \
  --roles authenticated=arn:aws:iam::<DEINE_ACCOUNT_ID>:role/CognitoAuthenticatedRole
```

### Schritt 5: App starten

#### 5.1 Setup ausführen

```bash
npm run setup
```

#### 5.2 Development-Server starten

```bash
npm run dev
```

#### 5.3 App öffnen

Öffne <http://localhost:5173> in deinem Browser

## Umgebungsvariablen-Referenz

### Erforderliche Variablen in `.env`

| Variable | Beschreibung | Beispiel |
|----------|-------------|----------|
| `VITE_AWS_REGION` | AWS Region | `eu-central-1` |
| `VITE_USER_POOL_ID` | Cognito User Pool ID | `eu-central-1_XXXXXXXXX` |
| `VITE_USER_POOL_CLIENT_ID` | User Pool Client ID | `xxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `VITE_IDENTITY_POOL_ID` | Cognito Identity Pool ID | `eu-central-1:xxxxxxxx-xxxx-...` |
| `VITE_DYNAMODB_TABLE_NAME` | DynamoDB Tabellen-Name | `KeyValueStore` |
| `VITE_AWS_ACCOUNT_ID` | Deine AWS Account ID | `123456789012` |

### Verschiedene Umgebungen

Du kannst verschiedene `.env`-Dateien für verschiedene Umgebungen erstellen:

- `.env` - Development (wird von `npm run dev` geladen)
- `.env.production` - Production (wird von `npm run build:prod` geladen)
- `.env.staging` - Staging-Umgebung

**Siehe `ENVIRONMENT_SETUP.md` für detaillierte Anweisungen.**

## Verwendung der App

### 1. Registrierung

- Neue Benutzer können sich mit E-Mail und Passwort registrieren
- **E-Mail-Bestätigung ist erforderlich** - prüfe auch den Spam-Ordner
- **Passwort-Anforderungen**:
  - Mindestens 8 Zeichen
  - Groß- und Kleinbuchstaben
  - Mindestens eine Zahl
  - Sonderzeichen optional

### 2. E-Mail-Bestätigung

- Nach der Registrierung erhältst du eine E-Mail mit einem 6-stelligen Code
- Gib den Code auf der Bestätigungsseite ein
- Der Code ist 24 Stunden gültig
- Nach erfolgreicher Bestätigung wirst du zur Anmeldeseite weitergeleitet

### 3. Anmeldung

- Anmeldung mit bestätigter E-Mail-Adresse und Passwort
- Automatische Session-Verwaltung mit JWT-Tokens
- Bei erfolgreicher Anmeldung wirst du zum Key-Value Manager weitergeleitet

### 4. Key-Value Management

- **Hinzufügen**: Neue Key-Value Paare erstellen und in DynamoDB speichern
- **Bearbeiten**: Bestehende Werte durch Klick auf "Bearbeiten" ändern
- **Löschen**: Einträge mit Bestätigungsdialog sicher entfernen
- **Anzeigen**: Alle eigenen Einträge in übersichtlicher, sortierbarer Tabelle
- **Aktualisieren**: Manueller Refresh-Button zum Neuladen der Daten
- **Echtzeit-Feedback**: Erfolgs- und Fehlermeldungen für alle Operationen

## Schnellstart für Entwickler

### 🚀 **Empfohlen: CDK Deployment**

```bash
git clone <repository-url>
cd cognito-keyvalue-app-v2
npm install

# CDK-Infrastruktur deployen
cd infrastructure
npm install
npx cdk bootstrap
npx cdk deploy

# .env mit CDK-Outputs konfigurieren
cd ..
cp .env.example .env
# CDK-Outputs in .env eintragen

# App starten
npm run setup
npm run dev
```

**Siehe `DEPLOYMENT_CDK.md` für detaillierte CDK-Anweisungen.**

### 🔧 **Alternative: Manuelles Setup**

Wenn du die AWS-Ressourcen manuell erstellen möchtest, folge den Schritten in Option 2 oben.

## Verfügbare Scripts

- `npm run dev` - Development-Server starten (lädt .env)
- `npm run build` - Production-Build erstellen
- `npm run build:prod` - Production-Build mit .env.production
- `npm run generate-policies` - IAM-Policies aus .env generieren
- `npm run setup` - Komplettes Setup (Policies + Info)
- `npm run preview` - Build lokal testen

## Sicherheit

- **Datentrennung**: Jeder Benutzer kann nur seine eigenen Daten sehen und bearbeiten
- **IAM-Policies**: Restriktive Berechtigungen basierend auf Cognito Identity
- **HTTPS**: Sichere Datenübertragung (in Produktion)
- **JWT-Token**: Sichere Authentifizierung mit automatischem Ablauf
- **Umgebungsvariablen**: Keine Secrets im Code - alles über .env-Dateien
- **Automatische Policy-Generierung**: IAM-Policies werden aus .env-Werten erstellt

### ⚠️ Wichtige Sicherheitshinweise

- **Niemals** `.env`-Dateien in Git committen
- **Immer** `.env.example` als Template verwenden  
- **Produktions-Secrets** nur in sicheren Umgebungen setzen
- **IAM-Policies** werden automatisch aus .env generiert - keine manuellen Änderungen nötig

## Deployment

### AWS Amplify (Empfohlen)

```bash
# Amplify CLI installieren
npm install -g @aws-amplify/cli

# Amplify initialisieren
amplify init

# Hosting hinzufügen
amplify add hosting

# Deployen
amplify publish
```

### Manuelles Deployment

1. **Build erstellen**:

   ```bash
   npm run build
   ```

2. **Zu S3 hochladen** und CloudFront konfigurieren

## Konfiguration

Die AWS-Konfiguration erfolgt jetzt vollständig über Umgebungsvariablen in der `.env`-Datei:

```javascript
// src/aws-config.js lädt automatisch aus .env
export const awsConfig = {
  region: import.meta.env.VITE_AWS_REGION,
  userPoolId: import.meta.env.VITE_USER_POOL_ID,
  userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
  dynamoDbTableName: import.meta.env.VITE_DYNAMODB_TABLE_NAME,
  accountId: import.meta.env.VITE_AWS_ACCOUNT_ID
};
```

**Alle AWS-spezifischen Werte sind jetzt umgebungsbasiert und nicht mehr hardcodiert!**

## Kosten

Diese Anwendung nutzt AWS-Services im Pay-per-Use-Modell:

- **Cognito**: Kostenlos für die ersten 50.000 MAU
- **DynamoDB**: Pay-per-Request Billing
- **IAM**: Kostenlos
- **Hosting**: Abhängig von der gewählten Lösung

## Entwicklung

### Projektstruktur

```bash
src/
├── components/              # React Komponenten
│   ├── LoginForm.jsx       # Anmeldeformular mit verbesserter Fehlerbehandlung
│   ├── SignUpForm.jsx      # Registrierungsformular mit Passwort-Validierung
│   ├── ConfirmationForm.jsx # E-Mail-Bestätigungsformular
│   ├── KeyValueManager.jsx # Vollständiger Manager mit DynamoDB-Integration
│   └── SimpleKeyValueManager.jsx # Demo-Version (nur Browser-Speicher)
├── services/               # AWS Service Integrationen
│   ├── auth.js            # Cognito Authentifizierung (Vollversion)
│   ├── auth-simple.js     # Vereinfachte Auth für Demo
│   └── dynamodb.js        # DynamoDB Operationen mit Credential-Management
├── aws-config.js          # AWS Konfiguration (zentral)
├── App.jsx               # Haupt-App mit vollständiger DynamoDB-Integration
├── App-working.jsx       # Demo-Version mit Browser-Speicher
├── App-login-only.jsx    # Nur Login-Test (für Entwicklung)
├── main.jsx              # App Entry Point
├── polyfills.js          # Browser-Kompatibilität
└── index.css             # Globale Styles
```

### Verfügbare App-Versionen

Die App hat verschiedene Versionen für unterschiedliche Entwicklungsphasen:

1. **`App.jsx`** (Produktionsversion)
   - Vollständige DynamoDB-Integration
   - Echte AWS Cognito-Authentifizierung
   - Persistente Datenspeicherung

2. **`App-working.jsx`** (Demo-Version)
   - Browser-Speicher statt DynamoDB
   - Für lokale Tests ohne AWS-Setup
   - Gleiche UI, aber temporäre Daten

3. **`App-login-only.jsx`** (Test-Version)
   - Nur Login-Funktionalität
   - Für Authentifizierungs-Tests

**Aktuelle Version wechseln** in `src/main.jsx`:

```javascript
// Für Produktion (DynamoDB)
import App from './App.jsx'

// Für Demo (Browser-Speicher)
import App from './App-working.jsx'
```

### Verfügbare Commands

- `npm run dev` - Entwicklungsserver starten
- `npm run build` - Produktions-Build erstellen
- `npm run preview` - Build lokal testen

## Troubleshooting

### Häufige Probleme und Lösungen

#### 1. Umgebungsvariablen werden nicht geladen

**Problem**: AWS-Konfiguration wird nicht aus .env geladen
**Lösung**:

- Stelle sicher, dass `.env` im Root-Verzeichnis liegt
- Variablen müssen mit `VITE_` beginnen
- Restart des Dev-Servers nach Änderungen: `npm run dev`

#### 2. AWS Account ID herausfinden

**Problem**: Du kennst deine AWS Account ID nicht
**Lösung**:

```bash
aws sts get-caller-identity --query Account --output text
```

#### 3. Button-Klicks funktionieren nicht

**Problem**: Beim Klick auf "Registrieren", "Anmelden" oder "Speichern" passiert nichts.
**Lösung**: Dieses Problem wurde behoben durch Änderung von `formAction="submit"` zu `onClick`-Handlers.

#### 4. DynamoDB-Zugriff verweigert

**Fehler**: `User is not authorized to perform: dynamodb:Query`
**Lösung**:

- IAM-Policy für `CognitoAuthenticatedRole` prüfen
- Sicherstellen, dass die Policy DynamoDB-Berechtigungen enthält
- IAM-Policies neu generieren: `npm run generate-policies`

#### 5. E-Mail-Bestätigung schlägt fehl

**Problem**: Code wird nicht akzeptiert
**Lösungen**:

- Code exakt aus der E-Mail kopieren (keine Leerzeichen)
- Spam-Ordner überprüfen
- Code ist nur 24 Stunden gültig
- Bei Problemen neuen Code anfordern

#### 6. CORS-Fehler

**Problem**: Cross-Origin-Fehler beim API-Aufruf
**Lösung**: Callback-URLs in Cognito User Pool Client konfigurieren:

- `http://localhost:5173`
- `https://localhost:5173`

#### 7. Session-Probleme

**Problem**: Benutzer wird automatisch abgemeldet
**Lösung**:

- JWT-Token-Ablauf prüfen
- Browser-Cache leeren
- Cookies und Local Storage prüfen

### Debug-Modus

Alle Formulare haben Debug-Logging aktiviert. Öffne die **Browser-Entwicklertools (F12)** und schaue in die **Konsole** für detaillierte Informationen:

#### Registrierung

bash```
Button clicked!
Form submitted!
Starte Registrierung für: <user@example.com>
Registrierung erfolgreich - weiterleitung zur Bestätigung

```

#### E-Mail-Bestätigung

bash```
Confirm button clicked!
Confirmation form submitted!
Starte E-Mail-Bestätigung für: user@example.com mit Code: 123456
E-Mail-Bestätigung erfolgreich
```

#### Anmeldung

bash```
Login button clicked!
Login form submitted!
Starte Anmeldung für: <user@example.com>
Anmeldung erfolgreich

```

#### Key-Value Speichern
bash```
KeyValue save button clicked!
KeyValueManager form submitted!
Speichere in DynamoDB: [user-id] testkey testvalue
DynamoDB Speichern erfolgreich
```

### Logs und Monitoring

- **Browser-Konsole**: Frontend-Fehler und Debug-Informationen
- **AWS CloudWatch**: Backend-Logs (falls Lambda-Funktionen verwendet werden)
- **AWS CloudTrail**: API-Aufrufe und Sicherheitsereignisse

### Bekannte Einschränkungen

1. **React Keys Warning**: Behoben durch `trackBy="key"` in Table-Komponenten
2. **Cloudscape Button Events**: Behoben durch Verwendung von `onClick` statt `formAction`
3. **IAM Policy Conditions**: Vereinfacht für bessere Kompatibilität

## Aktuelle Updates und Fixes

### Version 2.1 (Juni 2025)

#### 🐛 Behobene Probleme

- **Button-Event-Handling**: Alle Formulare verwenden jetzt `onClick`-Handler statt `formAction="submit"`
- **React Keys Warning**: Table-Komponenten haben jetzt `trackBy="key"` für eindeutige Zeilen-IDs
- **IAM-Berechtigungen**: DynamoDB-Policy vereinfacht für bessere Kompatibilität
- **Fehlerbehandlung**: Spezifische Fehlermeldungen für verschiedene Cognito-Fehler

#### ✨ Neue Features

- **Debug-Logging**: Umfassende Console-Logs für alle Formulare und API-Aufrufe
- **Verbesserte Validierung**: Bessere Passwort- und E-Mail-Validierung
- **Benutzerfreundlichkeit**: Klarere Fehlermeldungen und Erfolgsbenachrichtigungen
- **Multi-Version-Support**: Verschiedene App-Versionen für Entwicklung und Produktion

#### 🔧 Technische Verbesserungen

- **Error Boundaries**: Bessere Fehlerbehandlung auf Komponentenebene
- **State Management**: Optimierte Zustandsverwaltung für bessere Performance
- **Code-Struktur**: Aufgeteilte Services für bessere Wartbarkeit

### Nächste Schritte

- [ ] Sichere IAM-Policy mit Conditions wieder aktivieren
- [ ] Unit-Tests für alle Komponenten hinzufügen
- [ ] E2E-Tests mit Cypress implementieren
- [ ] Performance-Optimierungen
- [ ] PWA-Features hinzufügen

## Lizenz

MIT License

## Support

Bei Fragen oder Problemen:

1. **Debug-Logs prüfen**: Browser-Entwicklertools (F12) → Konsole
2. **Dokumentation lesen**: Besonders den Troubleshooting-Abschnitt
3. **Issue erstellen**: Im Repository mit detaillierter Fehlerbeschreibung
4. **AWS-Status prüfen**: <https://status.aws.amazon.com> für Service-Ausfälle

## Mitwirkende

Entwickelt mit ❤️ und AWS-Services für eine moderne, serverlose Webanwendung.
