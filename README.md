# Firebase setup for Resume.Maker

Steps to connect this project to Firebase:

1. Create a Firebase project at https://console.firebase.google.com/
2. In Project Settings -> General, under "Your apps", register a new Web app and copy the config object.
3. Open `firebase-config.js` and replace the `YOUR_...` placeholders with values from your Firebase config. The `projectId` is set to `resumeweb-b68d0` based on your Firebase project.
4. Make sure `apiKey`, `messagingSenderId`, and `appId` are correct. If you see `auth/api-key-not-valid`, the Firebase Web app config is still incomplete or invalid.
5. Enable Firestore in the Firebase Console under "Build" → "Firestore Database" and choose production mode or test mode.

> Note: Since this repository is already inside the hosting folder, the Firebase `public` directory is configured as `.` in `firebase.json`.

Authentication is already wired in: open `auth.html` to register or login before accessing `maker.html`.

This project saves resume data per user in Firestore under a `resumes` collection.

An admin dashboard is available at `admin.html` to view all saved user resumes.

Admin credentials:
- Email: `admin@gmail.com`
- Password: `admin123`

To use it, register or login with those credentials, then open `admin.html`.

If you want to deploy Firestore rules, use the example file `firestore.rules` in this folder.

To deploy hosting (optional):

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. From the repo root run: `firebase init` and select "Hosting". Set the public directory to `profile-cloud/profile-cloud`. Use the existing project `resumeweb-b68d0` when prompted.
4. Deploy: `firebase deploy --only hosting`

Notes:
- This repository hosts the static site found under `profile-cloud/profile-cloud` (contains `index.html`, `maker.html`, and `firebase-config.js`).
- The included `firebase-config.js` uses the compat SDK and a simple `initializeApp` call for quick setup. Replace with modular SDK code if you prefer.
