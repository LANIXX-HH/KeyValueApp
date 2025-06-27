import React, { useState, useEffect } from 'react';
import '@cloudscape-design/global-styles/index.css';
import { AppLayout, ContentLayout } from '@cloudscape-design/components';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import ConfirmationForm from './components/ConfirmationForm';
import KeyValueManager from './components/KeyValueManager';
import { authService } from './services/auth';
import { initializeDynamoDbClient } from './services/dynamodb';

const AUTH_STATES = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  CONFIRM: 'confirm',
  AUTHENTICATED: 'authenticated',
};

function App() {
  const [authState, setAuthState] = useState(AUTH_STATES.LOGIN);
  const [user, setUser] = useState(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Beim App-Start prüfen ob Benutzer bereits angemeldet ist
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      await initializeDynamoDbClient(currentUser.idToken);
      setUser(currentUser);
      setAuthState(AUTH_STATES.AUTHENTICATED);
    } catch (error) {
      // Benutzer ist nicht angemeldet
      setAuthState(AUTH_STATES.LOGIN);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    const result = await authService.signIn(email, password);
    await initializeDynamoDbClient(result.idToken);
    setUser(result);
    setAuthState(AUTH_STATES.AUTHENTICATED);
  };

  const handleSignUp = async (email, password) => {
    await authService.signUp(email, password);
    setPendingEmail(email);
    setAuthState(AUTH_STATES.CONFIRM);
  };

  const handleConfirm = async (email, code) => {
    await authService.confirmSignUp(email, code);
    setAuthState(AUTH_STATES.LOGIN);
  };

  const handleLogout = () => {
    authService.signOut();
    setUser(null);
    setAuthState(AUTH_STATES.LOGIN);
  };

  if (loading) {
    return (
      <AppLayout
        content={
          <ContentLayout>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Laden...
            </div>
          </ContentLayout>
        }
        navigationHide
        toolsHide
      />
    );
  }

  const renderContent = () => {
    switch (authState) {
      case AUTH_STATES.LOGIN:
        return (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToSignUp={() => setAuthState(AUTH_STATES.SIGNUP)}
          />
        );
      case AUTH_STATES.SIGNUP:
        return (
          <SignUpForm
            onSignUp={handleSignUp}
            onSwitchToLogin={() => setAuthState(AUTH_STATES.LOGIN)}
          />
        );
      case AUTH_STATES.CONFIRM:
        return (
          <ConfirmationForm
            email={pendingEmail}
            onConfirm={handleConfirm}
            onBack={() => setAuthState(AUTH_STATES.SIGNUP)}
          />
        );
      case AUTH_STATES.AUTHENTICATED:
        return <KeyValueManager user={user} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout
      content={<ContentLayout>{renderContent()}</ContentLayout>}
      navigationHide
      toolsHide
    />
  );
}

export default App;
