import React, { useState } from 'react';
import {
  Container,
  Header,
  Form,
  FormField,
  Input,
  Textarea,
  Button,
  SpaceBetween,
  Alert,
  Box,
  Table,
  TopNavigation,
} from '@cloudscape-design/components';

const SimpleKeyValueManager = ({ user, onLogout }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Simulierte Speicherung (nur im Browser-Speicher)
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('SimpleKeyValueManager form submitted!'); // Debug log
    
    setLoading(true);
    setSuccess('');

    try {
      console.log('Speichere Key-Value Paar:', key, value);
      
      // Simuliere API-Call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newItem = {
        key,
        value,
        timestamp: new Date().toISOString(),
      };

      // Zu bestehenden Items hinzufügen oder aktualisieren
      const existingIndex = items.findIndex(item => item.key === key);
      if (existingIndex >= 0) {
        const updatedItems = [...items];
        updatedItems[existingIndex] = newItem;
        setItems(updatedItems);
      } else {
        setItems([...items, newItem]);
      }

      setSuccess('Daten erfolgreich gespeichert! (Nur Browser-Speicher - DynamoDB folgt)');
      setKey('');
      setValue('');
      console.log('Speichern erfolgreich');
    } catch (err) {
      console.error('Fehler:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debug: Button click handler
  const handleButtonClick = (e) => {
    console.log('Save button clicked!', e);
    handleSubmit(e);
  };

  const handleDelete = (keyToDelete) => {
    setItems(items.filter(item => item.key !== keyToDelete));
    setSuccess('Eintrag gelöscht!');
  };

  const columnDefinitions = [
    {
      id: 'key',
      header: 'Schlüssel',
      cell: (item) => item.key,
      sortingField: 'key',
    },
    {
      id: 'value',
      header: 'Wert',
      cell: (item) => (
        <Box>
          {item.value.length > 100 ? item.value.substring(0, 100) + '...' : item.value}
        </Box>
      ),
    },
    {
      id: 'timestamp',
      header: 'Erstellt/Aktualisiert',
      cell: (item) => new Date(item.timestamp).toLocaleString('de-DE'),
      sortingField: 'timestamp',
    },
    {
      id: 'actions',
      header: 'Aktionen',
      cell: (item) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button
            size="small"
            onClick={() => {
              setKey(item.key);
              setValue(item.value);
            }}
          >
            Bearbeiten
          </Button>
          <Button
            size="small"
            variant="normal"
            onClick={() => handleDelete(item.key)}
          >
            Löschen
          </Button>
        </SpaceBetween>
      ),
    },
  ];

  return (
    <>
      <TopNavigation
        identity={{
          href: '#',
          title: 'Key-Value Store (Demo)',
        }}
        utilities={[
          {
            type: 'button',
            text: 'Abmelden',
            onClick: onLogout,
          },
        ]}
      />

      <Container>
        <SpaceBetween direction="vertical" size="l">
          <Header variant="h1" description="Demo-Version - Daten werden nur im Browser gespeichert">
            Key-Value Manager
          </Header>

          <Alert type="info">
            <strong>Demo-Modus:</strong> Diese Version speichert Daten nur temporär im Browser. 
            DynamoDB-Integration folgt nach erfolgreicher Authentifizierung.
          </Alert>

          {success && (
            <Alert type="success" dismissible onDismiss={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Container header={<Header variant="h2">Neuen Eintrag hinzufügen</Header>}>
            <Form onSubmit={handleSubmit}>
              <SpaceBetween direction="vertical" size="l">
                <FormField label="Schlüssel" errorText={!key && 'Schlüssel ist erforderlich'}>
                  <Input
                    value={key}
                    onChange={({ detail }) => setKey(detail.value)}
                    placeholder="z.B. benutzername, einstellung1, etc."
                    required
                  />
                </FormField>

                <FormField label="Wert" errorText={!value && 'Wert ist erforderlich'}>
                  <Textarea
                    value={value}
                    onChange={({ detail }) => setValue(detail.value)}
                    placeholder="Geben Sie hier den Wert ein..."
                    rows={4}
                    required
                  />
                </FormField>

                <Button
                  variant="primary"
                  loading={loading}
                  disabled={!key || !value}
                  onClick={handleButtonClick}
                >
                  Speichern
                </Button>
              </SpaceBetween>
            </Form>
          </Container>

          <Container header={<Header variant="h2">Gespeicherte Einträge</Header>}>
            <Table
              columnDefinitions={columnDefinitions}
              items={items}
              trackBy="key"
              sortingDisabled={false}
              empty={
                <Box textAlign="center" color="inherit">
                  <b>Keine Einträge vorhanden</b>
                  <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                    Fügen Sie Ihren ersten Key-Value Eintrag hinzu.
                  </Box>
                </Box>
              }
              header={
                <Header counter={`(${items.length})`}>
                  Ihre Daten (Browser-Speicher)
                </Header>
              }
            />
          </Container>
        </SpaceBetween>
      </Container>
    </>
  );
};

export default SimpleKeyValueManager;
