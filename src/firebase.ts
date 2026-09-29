import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration (Hardcoded for Vercel compatibility)
const firebaseConfig = {
  "apiKey": "AIzaSyDySiewR8fortI2dWkpODCZJ0Oc_iq_NMg",
  "authDomain": "al-hera-f4f7d.firebaseapp.com",
  "databaseURL": "https://al-hera-f4f7d-default-rtdb.firebaseio.com",
  "projectId": "al-hera-f4f7d",
  "storageBucket": "al-hera-f4f7d.firebasestorage.app",
  "messagingSenderId": "101331236415",
  "appId": "1:101331236415:web:5530b12a87ef4de8596a8a",
  "measurementId": "G-W3RSQH474X",
  "firestoreDatabaseId": "(default)"
};

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId === "(default)" ? undefined : firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestForToken = async () => {
  if (!messaging) return null;
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: 'BM757U8T3n7-59f7q7lR4r_9w_Yq_V-f-z_O_X_E_D_E_F_G_H_I_J_K_L_M_N_O_P' // This is a placeholder, usually not needed for standard FCM if configured in Firebase Console
    });
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
