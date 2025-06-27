// Polyfill for global object needed by amazon-cognito-identity-js
if (typeof global === 'undefined') {
  window.global = window;
}
