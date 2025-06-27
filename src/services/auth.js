import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { awsConfig } from '../aws-config';

const userPool = new CognitoUserPool({
  UserPoolId: awsConfig.userPoolId,
  ClientId: awsConfig.userPoolWebClientId,
});

export const authService = {
  // Benutzer registrieren
  signUp: (email, password) => {
    return new Promise((resolve, reject) => {
      userPool.signUp(email, password, [], null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },

  // Email bestätigen
  confirmSignUp: (email, code) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },

  // Benutzer anmelden
  signIn: (email, password) => {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve({
            accessToken: result.getAccessToken().getJwtToken(),
            idToken: result.getIdToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
            user: cognitoUser,
          });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  },

  // Aktuellen Benutzer abrufen
  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      
      if (!cognitoUser) {
        reject(new Error('No current user'));
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }

        if (!session.isValid()) {
          reject(new Error('Session is not valid'));
          return;
        }

        resolve({
          user: cognitoUser,
          session: session,
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
        });
      });
    });
  },

  // Benutzer abmelden
  signOut: () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  },

  // Prüfen ob Benutzer angemeldet ist
  isAuthenticated: () => {
    return new Promise((resolve) => {
      authService.getCurrentUser()
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });
  }
};
