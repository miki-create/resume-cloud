// firebase-config.js
// Replace the placeholder values with your Firebase project's config from the Firebase Console.
(function() {
  const firebaseConfig = {
    apiKey: "AIzaSyDaBxXWrfY_oDldM862IhWouWIqRwFl32A",
    authDomain: "resumeweb-b68d0.firebaseapp.com",
    projectId: "resumeweb-b68d0",
    storageBucket: "resumeweb-b68d0.firebasestorage.app",
    messagingSenderId: "550969179346",
    appId: "1:550969179346:web:3eea95f6d2eb4c483b810b",
    measurementId: "G-FCWR8NC571"
  };

  const hasPlaceholder = Object.values(firebaseConfig).some(value => typeof value === 'string' && value.startsWith('YOUR_'));
  window.firebaseConfig = firebaseConfig;
  window.firebaseConfigValid = !hasPlaceholder;

  if (hasPlaceholder) {
    console.warn('Firebase config is incomplete. Please replace the placeholder values in firebase-config.js with your Firebase Web app config.');
    return;
  }

  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    try {
      firebase.initializeApp(firebaseConfig);
      console.log('Firebase initialized');
    } catch (e) {
      console.warn('Firebase init failed:', e);
    }
  } else {
    console.warn('Firebase SDK not loaded. Make sure SDK `<script>` tags are present.');
  }
})();
