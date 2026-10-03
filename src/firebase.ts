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
  if (!messaging || typeof window === 'undefined') return null;
  try {
    const swReg = await navigator.serviceWorker?.ready;
    const options: any = {};
    if (swReg) {
      options.serviceWorkerRegistration = swReg;
    }
    
    const currentToken = await getToken(messaging, options).catch(async () => {
      return await getToken(messaging).catch(() => null);
    });

    if (currentToken) {
      console.log('FCM Token:', currentToken);
      return currentToken;
    }
  } catch (err) {
    console.log('FCM token retrieval notice: ', err);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
