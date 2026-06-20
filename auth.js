// auth.js
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';
let authMode = 'login';

function setMode(mode) {
  authMode = mode;
  document.getElementById('loginTab').classList.toggle('active', mode === 'login');
  document.getElementById('registerTab').classList.toggle('active', mode === 'register');
  document.getElementById('authTitle').innerText = mode === 'login' ? 'Login to Resume.Maker' : 'Create a new account';
  document.getElementById('authSubtitle').innerText = mode === 'login'
    ? 'Access your workspace and build resumes securely with Firebase Authentication.'
    : 'Register with your email to save your resume work and return later.';
  document.getElementById('authButton').innerText = mode === 'login' ? 'Login' : 'Register';
  setAuthMessage('');
}

function setAuthMessage(message, success = false) {
  const authMessage = document.getElementById('authMessage');
  authMessage.innerText = message;
  authMessage.style.color = success ? '#86efac' : '#fda4af';
}

function handleAuthAction() {
  if (!window.firebaseConfigValid) {
    setAuthMessage('Firebase config missing or invalid. Update firebase-config.js with your web app keys.');
    return;
  }

  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;

  if (!email || !password) {
    setAuthMessage('Please enter both email and password.');
    return;
  }

  if (authMode === 'login') {
    loginUser(email, password);
  } else {
    if (email === ADMIN_EMAIL) {
      setAuthMessage('The admin account is managed through login only. Use the Login tab with the admin credentials.', false);
      return;
    }
    registerUser(email, password);
  }
}

function registerUser(email, password) {
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      setAuthMessage('Registration successful! Redirecting...', true);
      setTimeout(() => { window.location.href = 'index.html'; }, 900);
    })
    .catch((error) => {
      setAuthMessage(error.message || 'Registration failed.');
    });
}

function loginUser(email, password) {
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      setAuthMessage('Login successful! Redirecting...', true);
      setTimeout(() => { window.location.href = 'index.html'; }, 900);
    })
    .catch((error) => {
      const adminFallback = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
      const canCreateAdmin = adminFallback && error.code === 'auth/user-not-found';

      if (canCreateAdmin) {
        createAdminAccount(email, password);
        return;
      }

      setAuthMessage(error.message || 'Login failed.');
    });
}

function createAdminAccount(email, password) {
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const adminUid = userCredential.user.uid;
      firebase.firestore().collection('admins').doc(adminUid).set({
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      })
        .then(() => {
          setAuthMessage('New admin account created and logged in automatically.', true);
          setTimeout(() => { window.location.href = 'index.html'; }, 900);
        })
        .catch((firestoreError) => {
          console.warn('Failed to set admin in Firestore:', firestoreError);
          setAuthMessage('Admin created but Firestore setup failed. Try reloading.');
        });
    })
    .catch((error) => {
      setAuthMessage(error.message || 'Admin login failed.');
    });
}

function signOutUser() {
  if (!firebase.auth) return;

  firebase.auth().signOut()
    .then(() => {
      window.location.href = 'auth.html';
    })
    .catch((error) => {
      console.warn('Sign out failed:', error);
    });
}

function initAuthWatcher() {
  var skipAuthRedirect = window.location.search.includes('logout=true');

  if (!window.firebaseConfigValid) {
    setAuthMessage('Firebase config missing or invalid. Update firebase-config.js with your Firebase web app keys.');
    return;
  }

  if (!firebase.auth) {
    setAuthMessage('Firebase Auth is not loaded.');
    return;
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (user && window.location.pathname.endsWith('auth.html') && !skipAuthRedirect) {
      window.location.href = 'index.html';
    }
    if (!user && skipAuthRedirect) {
      history.replaceState(null, '', 'auth.html');
    }
  });

  if (skipAuthRedirect) {
    history.replaceState(null, '', 'auth.html');
  }
}

window.addEventListener('load', function() {
  setMode('login');
  initAuthWatcher();
});
