import React, { useState } from 'react';
import '@cloudscape-design/global-styles/index.css';
import {
  AppLayout,
  ContentLayout,
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

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Test login form submitted!'); // Debug log
    setMessage(`Login-Versuch mit: ${email}`);
  };

  // Debug: Button click handler
  const handleButtonClick = (e) => {
    console.log('Test login button clicked!', e);
    handleSubmit(e);
  };

  return (
    <AppLayout
      content={
        <ContentLayout>
          <Container>
            <Box textAlign="center" padding="l">
              <Header variant="h1" description="Serverless Key-Value Store mit AWS Cognito">
                Anmeldung
              </Header>
            </Box>

            <Form onSubmit={handleSubmit}>
              <SpaceBetween direction="vertical" size="l">
                {message && (
                  <Alert type="info" dismissible onDismiss={() => setMessage('')}>
                    {message}
                  </Alert>
                )}

                <FormField label="E-Mail-Adresse">
                  <Input
                    value={email}
                    onChange={({ detail }) => setEmail(detail.value)}
                    type="email"
                    placeholder="ihre.email@beispiel.de"
                  />
                </FormField>

                <FormField label="Passwort">
                  <Input
                    value={password}
                    onChange={({ detail }) => setPassword(detail.value)}
                    type="password"
                    placeholder="Ihr Passwort"
                  />
                </FormField>

                <Button
                  variant="primary"
                  disabled={!email || !password}
                  onClick={handleButtonClick}
                >
                  Anmelden (Test)
                </Button>
              </SpaceBetween>
            </Form>
          </Container>
        </ContentLayout>
      }
      navigationHide
      toolsHide
    />
  );
}

export default App;
