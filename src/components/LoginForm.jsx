import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  Form,
  FormField,
  Input,
  Button,
  SpaceBetween,
  Alert,
  Box,
  Link,
} from '@cloudscape-design/components';

const LoginForm = ({ onLogin, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // Formular-Validierung
  useEffect(() => {
    const emailValid = email.trim().length > 0 && email.includes('@');
    const passwordValid = password.trim().length >= 8;
    setIsFormValid(emailValid && passwordValid);
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted!'); // Debug log
    
    if (!isFormValid) {
      setError('Bitte fülle alle Felder korrekt aus.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      console.log('Starte Anmeldung für:', email);
      console.log('onLogin function:', typeof onLogin);
      
      if (typeof onLogin !== 'function') {
        throw new Error('onLogin ist keine Funktion');
      }
      
      await onLogin(email, password);
      console.log('Anmeldung erfolgreich');
    } catch (err) {
      console.error('Anmeldungsfehler:', err);
      
      // Spezifische Cognito-Fehlermeldungen
      let errorMessage = 'Anmeldung fehlgeschlagen';
      
      if (err.code === 'NotAuthorizedException') {
        errorMessage = 'E-Mail oder Passwort ist falsch';
      } else if (err.code === 'UserNotConfirmedException') {
        errorMessage = 'Ihr Konto wurde noch nicht bestätigt. Bitte überprüfen Sie Ihre E-Mail.';
      } else if (err.code === 'UserNotFoundException') {
        errorMessage = 'Kein Benutzer mit dieser E-Mail-Adresse gefunden';
      } else if (err.code === 'TooManyRequestsException') {
        errorMessage = 'Zu viele Anmeldeversuche. Bitte warten Sie und versuchen Sie es später erneut.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enter-Taste Handler
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isFormValid && !loading) {
      console.log('Enter pressed - submitting form');
      handleSubmit(e);
    }
  };

  // Debug: Button click handler
  const handleButtonClick = (e) => {
    console.log('Login button clicked!', e);
    handleSubmit(e);
  };

  return (
    <Container>
      <Box textAlign="center" padding="l">
        <Header variant="h1" description="Melden Sie sich an, um auf Ihre Key-Value Daten zuzugreifen">
          Anmeldung
        </Header>
      </Box>

      <Form onSubmit={handleSubmit}>
        <SpaceBetween direction="vertical" size="l">
          {error && (
            <Alert type="error" dismissible onDismiss={() => setError('')}>
              {error}
            </Alert>
          )}

          <FormField 
            label="E-Mail-Adresse" 
            errorText={email && !email.includes('@') ? 'Gültige E-Mail-Adresse eingeben' : ''}
          >
            <Input
              value={email}
              onChange={({ detail }) => setEmail(detail.value)}
              onKeyDown={handleKeyPress}
              type="email"
              placeholder="ihre.email@beispiel.de"
              required
            />
          </FormField>

          <FormField 
            label="Passwort" 
            errorText={password && password.length < 8 ? 'Passwort muss mindestens 8 Zeichen haben' : ''}
          >
            <Input
              value={password}
              onChange={({ detail }) => setPassword(detail.value)}
              onKeyDown={handleKeyPress}
              type="password"
              placeholder="Ihr Passwort"
              required
            />
          </FormField>

          <Button
            variant="primary"
            loading={loading}
            disabled={!isFormValid || loading}
            onClick={handleButtonClick}
          >
            {isFormValid ? 'Anmelden' : 'Felder ausfüllen'}
          </Button>

          <Box textAlign="center">
            <Link onFollow={onSwitchToSignUp}>
              Noch kein Konto? Hier registrieren
            </Link>
          </Box>
        </SpaceBetween>
      </Form>
    </Container>
  );
};

export default LoginForm;
