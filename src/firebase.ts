import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
