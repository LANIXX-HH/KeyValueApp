import React, { useState, useEffect } from 'react';
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
  Modal,
  TopNavigation,
} from '@cloudscape-design/components';
import { dynamoDbService } from '../services/dynamodb';

const KeyValueManager = ({ user, onLogout }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Formular-Validierung
  useEffect(() => {
    const keyValid = key.trim().length > 0;
    const valueValid = value.trim().length > 0;
    setIsFormValid(keyValid && valueValid);
  }, [key, value]);

  // Benutzer-ID aus dem JWT Token extrahieren
  const getUserId = () => {
    try {
      const payload = JSON.parse(atob(user.idToken.split('.')[1]));
      return payload.sub;
    } catch (error) {
      console.error('Error extracting user ID:', error);
      return null;
    }
  };

  // Alle Items laden
  const loadItems = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;

      const userItems = await dynamoDbService.getUserItems(userId);
      setItems(userItems);
    } catch (err) {
      setError('Fehler beim Laden der Daten: ' + err.message);
    }
  };

  // Beim Laden der Komponente Items laden
  useEffect(() => {
    loadItems();
  }, []);

  // Key-Value Paar hinzufügen/aktualisieren
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('KeyValueManager form submitted!'); // Debug log
    
    if (!isFormValid) {
      setError('Bitte fülle alle Felder aus.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('Benutzer-ID nicht gefunden');
      }

      console.log('Speichere in DynamoDB:', userId, key, value);
      await dynamoDbService.putItem(userId, key, value);
      setSuccess('Daten erfolgreich gespeichert!');
      setKey('');
      setValue('');
      await loadItems();
      console.log('DynamoDB Speichern erfolgreich');
    } catch (err) {
      console.error('DynamoDB Speicherfehler:', err);
      setError('Fehler beim Speichern: ' + err.message);
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
    console.log('KeyValue save button clicked!', e);
    handleSubmit(e);
  };

  // Item löschen
  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('Benutzer-ID nicht gefunden');
      }

      await dynamoDbService.deleteItem(userId, itemToDelete.key);
      setSuccess('Eintrag erfolgreich gelöscht!');
      setDeleteModalVisible(false);
      setItemToDelete(null);
      await loadItems();
    } catch (err) {
      setError('Fehler beim Löschen: ' + err.message);
    }
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
            onClick={() => {
              setItemToDelete(item);
              setDeleteModalVisible(true);
            }}
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
          title: 'Key-Value Store',
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
          <Header variant="h1" description="Verwalten Sie Ihre Key-Value Daten">
            Key-Value Manager
          </Header>

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

          <Container header={<Header variant="h2">Neuen Eintrag hinzufügen</Header>}>
            <Form onSubmit={handleSubmit}>
              <SpaceBetween direction="vertical" size="l">
                <FormField 
                  label="Schlüssel" 
                  errorText={key && key.trim().length === 0 ? 'Schlüssel darf nicht leer sein' : ''}
                >
                  <Input
                    value={key}
                    onChange={({ detail }) => setKey(detail.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="z.B. benutzername, einstellung1, etc."
                    required
                  />
                </FormField>

                <FormField 
                  label="Wert" 
                  errorText={value && value.trim().length === 0 ? 'Wert darf nicht leer sein' : ''}
                >
                  <Textarea
                    value={value}
                    onChange={({ detail }) => setValue(detail.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Geben Sie hier den Wert ein..."
                    rows={4}
                    required
                  />
                </FormField>

                <Button
                  variant="primary"
                  loading={loading}
                  disabled={!isFormValid || loading}
                  onClick={handleButtonClick}
                >
                  {isFormValid ? 'Speichern' : 'Key und Value eingeben'}
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
                <Header
                  counter={`(${items.length})`}
                  actions={
                    <Button onClick={loadItems} iconName="refresh">
                      Aktualisieren
                    </Button>
                  }
                >
                  Ihre Daten
                </Header>
              }
            />
          </Container>
        </SpaceBetween>
      </Container>

      <Modal
        onDismiss={() => setDeleteModalVisible(false)}
        visible={deleteModalVisible}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setDeleteModalVisible(false)}>
                Abbrechen
              </Button>
              <Button variant="primary" onClick={handleDelete}>
                Löschen
              </Button>
            </SpaceBetween>
          </Box>
        }
        header="Eintrag löschen"
      >
        Sind Sie sicher, dass Sie den Eintrag mit dem Schlüssel "{itemToDelete?.key}" löschen möchten?
        Diese Aktion kann nicht rückgängig gemacht werden.
      </Modal>
    </>
  );
};

export default KeyValueManager;
