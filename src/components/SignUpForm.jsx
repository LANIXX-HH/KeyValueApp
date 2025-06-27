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

const SignUpForm = ({ onSignUp, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // Passwort-Validierung
  const validatePassword = (pwd) => {
    return pwd.length >= 8 && 
           /[A-Z]/.test(pwd) && 
           /[a-z]/.test(pwd) && 
           /[0-9]/.test(pwd);
  };

  // Formular-Validierung
  useEffect(() => {
    const emailValid = email.trim().length > 0 && email.includes('@');
    const passwordValid = validatePassword(password);
    const confirmPasswordValid = password === confirmPassword && confirmPassword.length > 0;
    setIsFormValid(emailValid && passwordValid && confirmPasswordValid);
  }, [email, password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!'); // Debug log
    
    if (!isFormValid) {
      setError('Bitte fülle alle Felder korrekt aus.');
      return;
    }
    
    setLoading(true);
    setError('');
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('Passwort muss Groß- und Kleinbuchstaben sowie Zahlen enthalten');
      setLoading(false);
      return;
    }

    try {
      console.log('Starte Registrierung für:', email);
      console.log('onSignUp function:', typeof onSignUp);
      
      if (typeof onSignUp !== 'function') {
        throw new Error('onSignUp ist keine Funktion');
      }
      
      await onSignUp(email, password);
      console.log('Registrierung erfolgreich - weiterleitung zur Bestätigung');
    } catch (err) {
      console.error('Registrierungsfehler:', err);
      
      // Spezifische Cognito-Fehlermeldungen
      let errorMessage = 'Registrierung fehlgeschlagen';
      
      if (err.code === 'UsernameExistsException') {
        errorMessage = 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits';
      } else if (err.code === 'InvalidPasswordException') {
        errorMessage = 'Passwort erfüllt nicht die Sicherheitsanforderungen';
      } else if (err.code === 'InvalidParameterException') {
        errorMessage = 'Ungültige E-Mail-Adresse oder Passwort';
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
    console.log('Button clicked!', e);
    handleSubmit(e);
  };

  return (
    <Container>
      <Box textAlign="center" padding="l">
        <Header variant="h1" description="Erstellen Sie ein neues Konto für den Key-Value Store">
          Registrierung
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
            description="Mindestens 8 Zeichen, mit Groß- und Kleinbuchstaben sowie Zahlen"
            errorText={password && !validatePassword(password) ? 'Passwort erfüllt nicht die Anforderungen' : ''}
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

          <FormField 
            label="Passwort bestätigen" 
            errorText={confirmPassword && password !== confirmPassword ? 'Passwörter stimmen nicht überein' : ''}
          >
            <Input
              value={confirmPassword}
              onChange={({ detail }) => setConfirmPassword(detail.value)}
              onKeyDown={handleKeyPress}
              type="password"
              placeholder="Passwort wiederholen"
              required
            />
          </FormField>

          <Button
            variant="primary"
            loading={loading}
            disabled={!isFormValid || loading}
            onClick={handleButtonClick}
          >
            {isFormValid ? 'Registrieren' : 'Felder ausfüllen'}
          </Button>

          <Box textAlign="center">
            <Link onFollow={onSwitchToLogin}>
              Bereits ein Konto? Hier anmelden
            </Link>
          </Box>
        </SpaceBetween>
      </Form>
    </Container>
  );
};

export default SignUpForm;
