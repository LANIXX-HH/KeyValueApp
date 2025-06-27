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
} from '@cloudscape-design/components';

const ConfirmationForm = ({ email, onConfirm, onBack }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // Formular-Validierung
  useEffect(() => {
    const codeValid = code.trim().length === 6 && /^\d{6}$/.test(code.trim());
    setIsFormValid(codeValid);
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Confirmation form submitted!'); // Debug log
    
    if (!isFormValid) {
      setError('Bitte geben Sie einen 6-stelligen Code ein.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      console.log('Starte E-Mail-Bestätigung für:', email, 'mit Code:', code);
      console.log('onConfirm function:', typeof onConfirm);
      
      if (typeof onConfirm !== 'function') {
        throw new Error('onConfirm ist keine Funktion');
      }
      
      await onConfirm(email, code);
      console.log('E-Mail-Bestätigung erfolgreich');
    } catch (err) {
      console.error('Bestätigungsfehler:', err);
      
      // Spezifische Cognito-Fehlermeldungen
      let errorMessage = 'Bestätigung fehlgeschlagen';
      
      if (err.code === 'CodeMismatchException') {
        errorMessage = 'Der eingegebene Code ist falsch. Bitte überprüfen Sie Ihre E-Mail.';
      } else if (err.code === 'ExpiredCodeException') {
        errorMessage = 'Der Code ist abgelaufen. Bitte fordern Sie einen neuen Code an.';
      } else if (err.code === 'LimitExceededException') {
        errorMessage = 'Zu viele Versuche. Bitte warten Sie und versuchen Sie es später erneut.';
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
    console.log('Confirm button clicked!', e);
    handleSubmit(e);
  };

  return (
    <Container>
      <Box textAlign="center" padding="l">
        <Header 
          variant="h1" 
          description={`Wir haben einen Bestätigungscode an ${email} gesendet. Bitte geben Sie den Code ein.`}
        >
          E-Mail bestätigen
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
            label="Bestätigungscode" 
            description="6-stelliger Code aus der E-Mail"
            errorText={code && !isFormValid ? 'Code muss 6 Ziffern haben' : ''}
          >
            <Input
              value={code}
              onChange={({ detail }) => setCode(detail.value)}
              onKeyDown={handleKeyPress}
              placeholder="123456"
              maxLength={6}
              required
            />
          </FormField>

          <SpaceBetween direction="horizontal" size="s">
            <Button onClick={onBack}>
              Zurück
            </Button>
            <Button
              variant="primary"
              loading={loading}
              disabled={!isFormValid || loading}
              onClick={handleButtonClick}
            >
              {isFormValid ? 'Bestätigen' : '6-stelligen Code eingeben'}
            </Button>
          </SpaceBetween>
        </SpaceBetween>
      </Form>
    </Container>
  );
};

export default ConfirmationForm;
