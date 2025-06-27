# Projekt-Struktur

```
cognito-keyvalue-app-v2/
├── public/                     # Statische Assets
│   ├── index.html             # HTML-Template
│   └── favicon.ico            # App-Icon
├── src/                       # Quellcode
│   ├── components/            # React-Komponenten
│   │   ├── LoginForm.jsx      # Anmeldeformular
│   │   ├── SignUpForm.jsx     # Registrierungsformular
│   │   ├── ConfirmationForm.jsx # E-Mail-Bestätigung
│   │   ├── KeyValueManager.jsx # DynamoDB-Manager
│   │   └── SimpleKeyValueManager.jsx # Demo-Manager
│   ├── services/              # AWS-Service-Integration
│   │   ├── auth.js           # Cognito-Authentifizierung
│   │   ├── auth-simple.js    # Demo-Authentifizierung
│   │   └── dynamodb.js       # DynamoDB-Operationen
│   ├── assets/               # Bilder, Icons, etc.
│   ├── aws-config.js         # AWS-Konfiguration
│   ├── polyfills.js          # Browser-Kompatibilität
│   ├── index.css             # Globale Styles
│   ├── main.jsx              # App-Entry-Point
│   ├── App.jsx               # Haupt-App (Produktion)
│   ├── App-working.jsx       # Demo-Version
│   └── App-login-only.jsx    # Test-Version
├── dist/                     # Build-Output (generiert)
├── node_modules/             # Dependencies (generiert)
├── package.json              # Projekt-Konfiguration
├── package-lock.json         # Dependency-Lock
├── vite.config.js           # Vite-Konfiguration
├── eslint.config.js         # ESLint-Konfiguration
└── README.md                # Projekt-Dokumentation
```

## Neue Features hinzufügen

### 1. Neue Komponente erstellen
```bash
# In src/components/
touch src/components/NewFeature.jsx
```

### 2. Service erweitern
```bash
# In src/services/
touch src/services/new-service.js
```

### 3. Route hinzufügen (falls Router verwendet)
```bash
npm install react-router-dom
```

### 4. Tests hinzufügen
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
mkdir src/__tests__
```
