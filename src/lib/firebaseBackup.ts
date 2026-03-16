import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'madrasa.db');

export async function initFirebaseBackup() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.log("Firebase credentials missing. Skipping cloud backup.");
    return;
  }

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: `${projectId}.appspot.com`
      });
    }

    const bucket = admin.storage().bucket();
    
    // Check if bucket exists
    const [metadata] = await bucket.getMetadata().catch(() => [null]);
    if (!metadata) {
      console.error("Firebase Storage bucket does not exist. Disabling cloud backup.");
      return;
    }

    const file = bucket.file('backup/madrasa.db');

    const [exists] = await file.exists();
    if (exists) {
      console.log("Downloading database backup from Firebase...");
      await file.download({ destination: dbPath });
      console.log("Database restored successfully from Firebase Storage.");
    } else {
      console.log("No existing backup found in Firebase. Starting fresh.");
    }
  } catch (error) {
    console.error("Firebase initialization/restore failed:", error);
  }
}

let backupTimeout: NodeJS.Timeout | null = null;

export function scheduleBackup() {
  if (!admin.apps.length) return;
  
  if (backupTimeout) clearTimeout(backupTimeout);
  
  backupTimeout = setTimeout(async () => {
    try {
      if (fs.existsSync(dbPath)) {
        const bucket = admin.storage().bucket();
        
        // Check if bucket exists
        const [metadata] = await bucket.getMetadata().catch(() => [null]);
        if (!metadata) {
          console.error("Firebase Storage bucket does not exist. Skipping backup.");
          return;
        }

        await bucket.upload(dbPath, {
          destination: 'backup/madrasa.db',
          metadata: { contentType: 'application/x-sqlite3' }
        });
        console.log("Database successfully backed up to Firebase.");
      }
    } catch (error: any) {
      console.error("Failed to backup database to Firebase:", error.message || error);
    }
  }, 5000); // 5 seconds debounce after the last write
}
