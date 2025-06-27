// Template für neue Komponenten
import React, { useState } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  FormField,
  Input,
  Alert
} from '@cloudscape-design/components';

const NewComponent = ({ onAction }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAction = async () => {
    console.log('Action button clicked!'); // Debug-Logging
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Ihre Logik hier
      await onAction();
      setSuccess('Aktion erfolgreich!');
    } catch (err) {
      console.error('Fehler:', err);
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      header={
        <Header variant="h2">
          Neue Komponente
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {error && (
          <Alert type="error" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert type="success" dismissible onDismiss={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <FormField label="Beispiel-Feld">
          <Input placeholder="Eingabe..." />
        </FormField>

        <Button
          variant="primary"
          loading={loading}
          onClick={handleAction}
        >
          Aktion ausführen
        </Button>
      </SpaceBetween>
    </Container>
  );
};

export default NewComponent;
