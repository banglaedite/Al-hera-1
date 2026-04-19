import express from "express";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import * as xlsx from 'xlsx';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting server with NODE_ENV:", process.env.NODE_ENV);

const ADMIN_CONFIG_PATH = path.join(__dirname, "firebase-admin-config.json");

// Firebase Configuration (Hardcoded for Vercel compatibility)
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

// Service Account Credentials (Hardcoded for Vercel compatibility)
const hardcodedServiceAccount = {
  "project_id": "al-hera-f4f7d",
  "client_email": "firebase-adminsdk-fbsvc@al-hera-f4f7d.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDJGKzl7nKU47Tj\nzd6OQTrIc7PpIDr5rZtUux14ftuRensGD2lKKVk6T0SUvwkj1ep+/NTLiSayMlMh\n/rL6Dp4L50eoAyS3H2+F+p18CENyUzIgnEmDcYKfHph44DHTBMBq32Is4BQSUdgQ\n5F9f0vopJdcwRLuLPmjzfFFSbeFyjOfjP/7fUqUfgznINTcQncs49GJvkmMb2rIi\nRty9GZYpbTwolchNAa0rhnyEBNRbptuG7IQBelLoWi1OAfmLWx6XB7LGeFN1vXQe\n9tdNJ9mmCFC/LqQHt/E8nWh4KezyWdaO+QBj8QJBAcXv5TJgazpPisEcd1MKO7qR\ntjydOETbAgMBAAECggEACE3WYfAXgjIgwkwdwHEUkivuTUD/hZB7FzIiNLDEX2Bf\nBn6KF1pmUHlERslKSJwo8p/SfQ1kGtjnfSXUUonoivmgXZpevQo8jnGCvhksl2LR\nHCe9WhEiD8ZjKco30PBVdZDHIefRXF3cD6YRPCwmGILIdh2/mC+vS+gFI3HdXpiu\nh/J5eCRio5FN63Z+i2smkSJn9M07vKHHF8YKt8RFK7oveGaVdksiSKGoq+NIru9V\nTmJIkCnIRwtTa4sOcxLf4/gIaIqXPOLL7khrTk4heDyVTyOwMo2nzLs+fl2/mAVP\n1uopDj8tRG3ayttOlzDQ4Fz7t1kfTs0mv2bKkyIv5QKBgQDx33H0peZs1DjRlUsc\ngtobUkRBBRWjGf7LEBbkiqnxJtljfGS08k8Ok73l2snnBsmgBbx+gA+/CFWI6UGX\nt5HIyED9zmfBmTt1QZA/uYk/MuSjrWjNs33c5RnmpV71kJq/Wm1ajprbkKCA3hg9\nXTHvzJWitnTZj8T14J58DeNDRwKBgQDU14dWkoYaD0qU5rXtvrxOCWraK+/Y6gpt\nYro4ghNbf+R9p1iykwZwY8W2JW6l4ZPnY6ZVSnSe7XOK0Wq82MZLt3XnKQs+/Onu\nPXs17EmGqRMPT7jgnJsZs9GBbekpYZu0UQC3jWlz0NnrnYdjNejCGWyFgHbWdjtn\nyLowiSnzzQKBgQCsl6JsTdmgPMuSmjKv1JuoNUrpDqTC7vDGm+OKD3x2zR8Ag6ol\nCGbrYvd1xmqeRVSosI8xwVX7HgpTGQcqKN6JZIQj2B5nol0wLamuH0nVZA6M0Vfg\nuL0OXBjgYY7iMd6Kvw8bOHk+RfSSIGkxmIfispzwL7wv5wxH25Gbuhk6TwKBgQDP\nMA86ot+PtprvX7ZxfF5pyJkPT/3mtcz4tkZ4g4a8Zz7RYnnhO2XlOfpYWQ/gwjnr\n4QElvZjQrGzxEPJKaup9AlXvc/DSm/hMReUOlLjuMN+w4/YgD9KbroOe7pMuCSo8\n2S1NgIbKit/XkD0ewneVmpIdUvRbyDQDz04PuTXxcQKBgAl0K0u5BJafZe/1jnP2\nqvP07VCF/RNWk8aJm4h5QBejcfO9kNEoIXgSZYsbssE0p0rimY+xnpkNIsXV95od\nNkZNMulMDn2Idv2soDYkeDQWvWLZVpybSDwzr21cBOymLorEfZjKX4PsjlhTWLE/\nCC7Q4Oo/oVAV+EOABx+tlm0M\n-----END PRIVATE KEY-----\n"
};

let firestore: any = null;
let currentConfig: any = null;

// Firebase Admin Initialization Helper
function getFirestoreInstance() {
  if (firestore) return firestore;

  try {
    let config = { ...hardcodedServiceAccount };
    let dbId = firebaseConfig.firestoreDatabaseId;

    // Try to load from dynamic config file
    if (fs.existsSync(ADMIN_CONFIG_PATH)) {
      try {
        const dynamicConfig = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, 'utf-8'));
        config = {
          project_id: dynamicConfig.projectId,
          client_email: dynamicConfig.clientEmail,
          private_key: dynamicConfig.privateKey,
        };
        dbId = dynamicConfig.databaseId || "(default)";
        console.log("Loaded dynamic Firebase Admin config from file.");
      } catch (e) {
        console.error("Error parsing dynamic config file:", e);
      }
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || config.project_id;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || config.client_email;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || config.private_key;

    if (!admin.apps.length) {
      console.log("Initializing Firebase Admin with project:", projectId);
      const privateKeyFormatted = (privateKey || "").replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKeyFormatted,
        }),
        storageBucket: `${projectId}.appspot.com`
      });
      console.log("Firebase Admin initialized successfully.");
    }
    
    const finalDbId = dbId === "(default)" ? undefined : dbId;
    const appInstance = admin.app();
    firestore = finalDbId ? getAdminFirestore(appInstance, finalDbId) : getAdminFirestore(appInstance);
    firestore.settings({ ignoreUndefinedProperties: true });
    console.log("Firestore instance created with ignoreUndefinedProperties: true");
    return firestore;
  } catch (err) {
    console.error("Firebase Admin init error:", err);
    return null;
  }
}

const app = express();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ensure Firestore is initialized for all requests
app.use((req, res, next) => {
  getFirestoreInstance();
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const parseRoll = (val: any) => {
  if (val === undefined || val === null || val === "") return Infinity;
  let s = String(val).trim();
  const banglaDigits: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  s = s.replace(/[০-৯]/g, (m: string) => banglaDigits[m]);
  const n = parseInt(s.replace(/[^0-9]/g, ''));
  return isNaN(n) ? Infinity : n;
};

async function verifyAdminOrSubAdmin(passwordOrEmail: string, requiredPermission?: string) {
  const adminPassword = process.env.VITE_ADMIN_PASSWORD || "1234";
  if (passwordOrEmail === adminPassword || passwordOrEmail === "১২৩৪") return true;
  
  try {
    const db = getFirestoreInstance();
    if (!db) return false;
    const snapshot = await db.collection("sub_admins").where("email", "==", passwordOrEmail).get();
    if (!snapshot.empty) {
      // If a specific permission is required, we could check it here.
      // For now, if they are a valid sub-admin, we allow the action.
      // The frontend already restricts access to the relevant tabs.
      return true;
    }
  } catch (e) {
    console.error("Error verifying sub-admin:", e);
  }
  return false;
}

app.post("/api/admin/verify-password", async (req, res, next) => {
  try {
    const { password } = req.body;
    if (await verifyAdminOrSubAdmin(password, "all")) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" });
    }
  } catch (error) {
    next(error);
  }
});

// API to update Firebase Config
app.post("/api/admin/update-firebase-config", async (req, res) => {
  const { projectId, clientEmail, privateKey, databaseId, password } = req.body;
  
  if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }

  try {
    const config = { projectId, clientEmail, privateKey, databaseId };
    fs.writeFileSync(ADMIN_CONFIG_PATH, JSON.stringify(config, null, 2));
    
    // Reset Firebase Admin to re-initialize with new credentials
    if (admin.apps.length) {
      await Promise.all(admin.apps.map(app => app?.delete()));
    }
    firestore = null;
    
    // Test initialization
    const db = getFirestoreInstance();
    if (!db) {
      throw new Error("Failed to initialize with new credentials");
    }

    res.json({ success: true, message: "Firebase configuration updated and reloaded." });
  } catch (error: any) {
    console.error("Error updating Firebase config:", error);
    res.status(500).json({ error: "Failed to update configuration", details: error.message });
  }
});

// Middleware to check Firestore
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') && req.path !== '/api/health') {
    const db = getFirestoreInstance();
    if (!db) {
      return res.status(500).json({ 
        error: "Firestore not initialized", 
        details: "The server failed to connect to Firebase. Please check the logs." 
      });
    }
  }
  next();
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      throw new Error("Firestore initialization failed");
    }
    const test = await db.collection("site_settings").limit(1).get();
    res.json({ 
      status: "ok", 
      firestore: "connected", 
      data: !test.empty,
      config: {
        projectId: hardcodedServiceAccount.project_id,
        clientEmail: hardcodedServiceAccount.client_email,
        hasPrivateKey: !!hardcodedServiceAccount.private_key,
        databaseId: firebaseConfig.firestoreDatabaseId
      }
    });
  } catch (err: any) {
    res.status(500).json({ 
      status: "error", 
      firestore: "disconnected", 
      error: err.message,
      config: {
        projectId: hardcodedServiceAccount.project_id,
        clientEmail: hardcodedServiceAccount.client_email,
        hasPrivateKey: !!hardcodedServiceAccount.private_key,
        databaseId: firebaseConfig.firestoreDatabaseId
      }
    });
  }
});

// Hardcoded SMTP Settings
process.env.SMTP_HOST = "smtp.gmail.com";
process.env.SMTP_PORT = "587";
process.env.SMTP_USER = "newdrshahidul@gmail.com";
process.env.SMTP_PASS = "dwaxlbdksrgckucr";
process.env.SENDER_EMAIL = "newdrshahidul@gmail.com";

// --- Database Seeding ---
async function seedDatabase() {
  const db = getFirestoreInstance();
  if (!db) {
    console.warn("Skipping database seeding: Firestore not initialized.");
    return;
  }
  console.log("Starting database seeding check...");
  try {
    const settingsRef = db.collection("site_settings").doc("1");
    const settingsDoc = await settingsRef.get();
    console.log("Site settings doc check complete. Exists:", settingsDoc.exists);
    
    if (!settingsDoc.exists) {
      console.log("Seeding default site settings...");
      await settingsRef.set({
          title: "মাদরাসা ম্যানেজমেন্ট সিস্টেম",
          subtitle: "একটি আধুনিক ও ডিজিটাল মাদরাসা গড়ার প্রত্যয়ে",
          phone: "01700000000",
          email: "info@madrasa.com",
          address: "ঢাকা, বাংলাদেশ",
          footer_text: "© ২০২৪ মাদরাসা ম্যানেজমেন্ট সিস্টেম। সর্বস্বত্ব সংরক্ষিত।",
          enable_bkash: 1,
          enable_nagad: 1,
          enable_rocket: 1,
          show_features_as_buttons: 1,
          show_food_as_buttons: 1,
          show_showcase_as_buttons: 1,
          qr_code_url: "",
          admin_password: "1234"
        });
        console.log("Default site settings seeded.");
      }

      const featuresSnapshot = await db.collection("features").get();
      console.log("Features check complete. Count:", featuresSnapshot.size);
      
      if (featuresSnapshot.empty) {
        console.log("Seeding default features...");
        const defaultFeatures = [
          { title: "অনলাইন ভর্তি", description: "সহজ ও দ্রুত অনলাইন ভর্তি প্রক্রিয়া", icon: "GraduationCap", is_active: 1 },
          { title: "ডিজিটাল হাজিরা", description: "ছাত্র ও শিক্ষকদের স্মার্ট হাজিরা সিস্টেম", icon: "CheckCircle2", is_active: 1 },
          { title: "ফলাফল ব্যবস্থাপনা", description: "পরীক্ষার ফলাফল ও প্রোগ্রেস রিপোর্ট", icon: "Award", is_active: 1 },
          { title: "ফি ম্যানেজমেন্ট", description: "অনলাইন ফি প্রদান ও রশিদ সংগ্রহ", icon: "CreditCard", is_active: 1 }
        ];
        for (const feature of defaultFeatures) {
          await db.collection("features").add(feature);
        }
        console.log("Default features seeded.");
      }

      const classesSnapshot = await db.collection("classes").get();
      const existingClasses = classesSnapshot.docs.map(doc => doc.data().name);
      const defaultClasses = ["প্রথম শ্রেণি", "দ্বিতীয় শ্রেণি", "তৃতীয় শ্রেণি", "চতুর্থ শ্রেণি", "পঞ্চম শ্রেণি", "ষষ্ঠ শ্রেণি", "সপ্তম শ্রেণি", "অষ্টম শ্রেণি", "নবম শ্রেণি", "দশম শ্রেণি"];
      
      let orderCounter = classesSnapshot.docs.length + 1;
      let seededAny = false;
      for (const className of defaultClasses) {
        if (!existingClasses.includes(className)) {
          await db.collection("classes").add({ name: className, order: orderCounter++, is_active: true });
          seededAny = true;
        }
      }
      if (seededAny) {
        console.log("Missing default classes seeded.");
      }

      const incomeCatSnapshot = await db.collection("income_categories").get();
      if (incomeCatSnapshot.empty) {
        console.log("Seeding default income categories...");
        const defaultIncomeCats = ["মাসিক বেতন", "ভর্তি ফি", "সেশন ফি", "পরীক্ষা ফি", "দান", "অন্যান্য"];
        for (const cat of defaultIncomeCats) {
          await db.collection("income_categories").add({ name: cat });
        }
      }

      const expenseCatSnapshot = await db.collection("expense_categories").get();
      if (expenseCatSnapshot.empty) {
        console.log("Seeding default expense categories...");
        const defaultExpenseCats = ["শিক্ষক বেতন", "স্টাফ বেতন", "ভাড়া", "বিদ্যুৎ বিল", "মেরামত", "আপ্যায়ন", "অন্যান্য"];
        for (const cat of defaultExpenseCats) {
          await db.collection("expense_categories").add({ name: cat });
        }
      }
    } catch (error) {
      console.error("Seeding error:", error);
    }
  }

try {
  await seedDatabase();
} catch (e) {
  console.error("Critical error during database seeding:", e);
}

  // --- Sequential Serial Number Helper ---
  async function getNextSerial(prefix: string = "AHM") {
    const db = getFirestoreInstance();
    const counterRef = db.collection("counters").doc(prefix);
    
    return await db.runTransaction(async (transaction: any) => {
      const counterDoc = await transaction.get(counterRef);
      let nextNum = 1;
      
      if (counterDoc.exists) {
        nextNum = (counterDoc.data().lastNum || 0) + 1;
      }
      
      transaction.set(counterRef, { lastNum: nextNum }, { merge: true });
      
      const paddedNum = nextNum.toString().padStart(4, '0');
      return `${prefix}-${paddedNum}`;
    });
  }

  // --- Exams ---
  app.get("/api/exams", async (req, res) => {
    try {
      const db = getFirestoreInstance();
      const examsSnapshot = await db.collection("exams").orderBy("date", "desc").get();
      const exams = examsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(exams);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch exams" });
    }
  });

  app.post("/api/exams", async (req, res) => {
    const { name, year } = req.body;
    try {
      const db = getFirestoreInstance();
      await db.collection("exams").add({ 
        name, 
        year: year || new Date().getFullYear().toString(),
        date: new Date().toISOString() 
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add exam" });
    }
  });

  // --- Sub-Admins ---
  app.get("/api/admin/sub-admins", async (req, res) => {
    try {
      const db = getFirestoreInstance();
      const snapshot = await db.collection("sub_admins").get();
      const subAdmins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(subAdmins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sub-admins" });
    }
  });

  app.post("/api/admin/sub-admins", async (req, res) => {
    const { email, teacherId, permissions } = req.body;
    try {
      const db = getFirestoreInstance();
      await db.collection("sub_admins").add({
        email,
        teacherId: teacherId || null,
        permissions: permissions || [],
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add sub-admin" });
    }
  });

  app.put("/api/admin/sub-admins/:id", async (req, res) => {
    const { id } = req.params;
    const { email, teacherId, permissions } = req.body;
    try {
      const db = getFirestoreInstance();
      await db.collection("sub_admins").doc(id).update({
        email,
        teacherId: teacherId || null,
        permissions: permissions || [],
        updated_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update sub-admin" });
    }
  });

  app.delete("/api/admin/sub-admins/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    const { id } = req.params;
    try {
      const db = getFirestoreInstance();
      await db.collection("sub_admins").doc(id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sub-admin" });
    }
  });

  // --- Notification Counts ---
  app.get("/api/admin/pending-counts", async (req, res) => {
    try {
      const db = getFirestoreInstance();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const [payments, applications, notices] = await Promise.all([
        db.collection("pending_payments").where("status", "==", "pending").get(),
        db.collection("admissions").where("status", "==", "pending").get(),
        db.collection("notices").where("created_at", ">=", yesterday.toISOString()).get()
      ]);
      
      res.json({
        payments: payments.size,
        applications: applications.size,
        newNotices: notices.size
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending counts" });
    }
  });
  
  app.get("/api/admin/history", async (req, res) => {
    try {
      const db = getFirestoreInstance();
      const { start_date, end_date } = req.query;
      let feesQuery: any = db.collection("fees");
      let incomeQuery: any = db.collection("income");
      let expensesQuery: any = db.collection("expenses");

      if (start_date) {
        feesQuery = feesQuery.where("paid_date", ">=", start_date);
        incomeQuery = incomeQuery.where("date", ">=", start_date);
        expensesQuery = expensesQuery.where("date", ">=", start_date);
      }
      if (end_date) {
        feesQuery = feesQuery.where("paid_date", "<=", end_date + "T23:59:59.999Z");
        incomeQuery = incomeQuery.where("date", "<=", end_date + "T23:59:59.999Z");
        expensesQuery = expensesQuery.where("date", "<=", end_date + "T23:59:59.999Z");
      }

      const [feesSnap, incomeSnap, expensesSnap] = await Promise.all([
        feesQuery.get(),
        incomeQuery.get(),
        expensesQuery.get()
      ]);

      const allData: any[] = [];

      feesSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === "paid") {
          allData.push({
            id: doc.id,
            type: 'fee',
            date: data.paid_date,
            amount: data.amount,
            category: data.category,
            student_name: data.student_name,
            student_id: data.student_id,
            transaction_id: data.transaction_id,
            ...data
          });
        }
      });

      incomeSnap.docs.forEach(doc => {
        const data = doc.data();
        allData.push({
          id: doc.id,
          type: 'income',
          date: data.paid_date || data.date,
          amount: Number(data.amount),
          category: data.category,
          student_name: data.student_name || 'অন্যান্য',
          student_id: data.student_id,
          transaction_id: data.transaction_id || `INC-${doc.id.substring(0,6).toUpperCase()}`,
          ...data
        });
      });

      expensesSnap.docs.forEach(doc => {
        const data = doc.data();
        allData.push({
          id: doc.id,
          type: 'expense',
          date: data.date,
          amount: Number(data.amount),
          category: data.category,
          student_name: 'খরচ',
          transaction_id: `EXP-${doc.id.substring(0,6).toUpperCase()}`,
          ...data
        });
      });

      allData.sort((a, b) => {
        const timeA = a.created_at || a.timestamp || a.date;
        const timeB = b.created_at || b.timestamp || b.date;
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });

      res.json(allData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch all history" });
    }
  });

  app.post("/api/admin/transactions", async (req, res) => {
    try {
      const data = req.body;
      if (!data.transaction_id || data.transaction_id.startsWith('TXN-')) {
        data.transaction_id = await getNextSerial("AHM");
      }
      const db = getFirestoreInstance();
      const docRef = await db.collection("transactions").add(data);
      res.json({ success: true, id: docRef.id, transaction_id: data.transaction_id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.get("/api/admin/transactions", async (req, res) => {
    try {
      const db = getFirestoreInstance();
      const transactionsSnapshot = await db.collection("transactions").orderBy("paid_date", "desc").get();
      const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.delete("/api/admin/all-history/:type/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    const { type, id } = req.params;
    try {
      const db = getFirestoreInstance();
      let collectionName = "";
      if (type === "fee") collectionName = "fees";
      else if (type === "income") collectionName = "income";
      else if (type === "expense") collectionName = "expenses";
      else return res.status(400).json({ error: "Invalid type" });

      const docRef = db.collection(collectionName).doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        await db.collection("delete_history").add({
          type: `history_${type}`,
          details: JSON.stringify(docSnap.data()),
          deleted_at: new Date().toISOString()
        });

        if (type === "fee") {
          const feeData = docSnap.data();
          if (feeData?.category === 'মাসিক বেতন') {
            await docRef.delete();
          } else {
            await docRef.update({
              status: 'unpaid',
              paid_date: null,
              transaction_id: null
            });
          }
        } else {
          await docRef.delete();
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete history item" });
    }
  });

  app.delete("/api/admin/transactions/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      const db = getFirestoreInstance();
      const transactionRef = db.collection("transactions").doc(req.params.id);
      const transactionDoc = await transactionRef.get();
      
      if (transactionDoc.exists) {
        await db.collection("delete_history").add({
          type: 'fee_transaction',
          details: JSON.stringify(transactionDoc.data()),
          deleted_at: new Date().toISOString()
        });
        await transactionRef.delete();
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // --- Delete History ---
  app.get("/api/admin/delete-history", async (req, res) => {
    const { limit = 50, offset = 0, start_date, end_date } = req.query;
    try {
      const db = getFirestoreInstance();
      let query: any = db.collection("delete_history");
      if (start_date) {
        query = query.where("deleted_at", ">=", start_date);
      }
      if (end_date) {
        query = query.where("deleted_at", "<=", end_date + "T23:59:59.999Z");
      }
      query = query.orderBy("deleted_at", "desc");
      
      const snapshot = await query.get();
      const allHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const total = allHistory.length;
      const history = allHistory.slice(Number(offset), Number(offset) + Number(limit));
      
      res.json({
        data: history,
        total,
        hasMore: Number(offset) + Number(limit) < total
      });
    } catch (error) {
      console.error("Error fetching delete history:", error);
      res.status(500).json({ error: "Failed to fetch delete history" });
    }
  });

  // --- Parent Payment ---
  app.post("/api/parent/pay", async (req, res) => {
    const { feeId, transactionId, method, phone } = req.body;
    try {
      const db = getFirestoreInstance();
      await db.collection("fees").doc(feeId).update({
        status: 'paid',
        paid_date: new Date().toISOString(),
        transaction_id: `${method}-${transactionId}`
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Payment failed" });
    }
  });

  // --- Features ---
  app.get("/api/donations", async (req, res) => {
    try {
      const db = getFirestoreInstance();
      const donationsSnapshot = await db.collection("donations").orderBy("date", "desc").get();
      const donations = donationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(donations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch donations" });
    }
  });

  app.post("/api/donations", async (req, res) => {
    const { donor_name, amount, category, transaction_id } = req.body;
    try {
      const db = getFirestoreInstance();
      const finalTrxId = transaction_id || await getNextSerial("AHM");
      await db.collection("donations").add({ donor_name, amount, category, transaction_id: finalTrxId, date: new Date().toISOString() });
      res.json({ success: true, transaction_id: finalTrxId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add donation" });
    }
  });

  app.get("/api/features", async (req, res) => {
    try {
      const db = getFirestoreInstance();
      const featuresSnapshot = await db.collection("features").where("is_active", "==", 1).get();
      const features = featuresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(features);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch features" });
    }
  });

  app.post("/api/admin/features", async (req, res) => {
    const { title, description, image_url, icon, is_active } = req.body;
    try {
      const db = getFirestoreInstance();
      await db.collection("features").add({ 
        title, 
        description, 
        image_url, 
        icon, 
        is_active: is_active !== undefined ? Number(is_active) : 1 
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add feature" });
    }
  });

  app.delete("/api/admin/features/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      const db = getFirestoreInstance();
      await db.collection("features").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete feature" });
    }
  });

  app.put("/api/admin/features/:id", async (req, res) => {
    const { title, description, image_url, icon, is_active } = req.body;
    try {
      const db = getFirestoreInstance();
      await db.collection("features").doc(req.params.id).update({
        title,
        description,
        image_url,
        icon,
        is_active: is_active !== undefined ? Number(is_active) : 1
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update feature" });
    }
  });

  // --- Fee Reports ---
  app.get("/api/admin/fees/monthly-report", async (req, res) => {
    const { className, month } = req.query; // month format: 'YYYY-MM'
    
    try {
      const db = getFirestoreInstance();
      const studentsSnapshot = await db.collection("students").where("class", "==", className).get();
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const report = await Promise.all(students.map(async (student: any) => {
        const feesSnapshot = await db.collection("transactions")
          .where("student_id", "==", student.id)
          .where("paid_date", ">=", `${month}-01`)
          .where("paid_date", "<=", `${month}-31T23:59:59.999Z`)
          .get();
        
        const fee = feesSnapshot.docs[0]?.data();

        return {
          ...student,
          status: fee ? 'paid' : 'unpaid',
          amount: fee ? fee.amount : 0,
          paid_date: fee ? fee.paid_date : null
        };
      }));

      res.json(report);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  app.get("/api/admin/fees/due-report", async (req, res) => {
    const { className } = req.query;
    
    try {
      const db = getFirestoreInstance();
      const studentsSnapshot = await db.collection("students").where("class", "==", className).where("deleted_at", "==", null).get();
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const report = await Promise.all(students.map(async (student: any) => {
        const feesSnapshot = await db.collection("fees")
          .where("student_id", "==", student.id)
          .where("status", "==", "unpaid")
          .get();
        
        const dueFees = feesSnapshot.docs.map(doc => doc.data());
        const totalDue = dueFees.reduce((sum: number, f: any) => sum + f.amount, 0);

        return {
          ...student,
          totalDue,
          dueMonths: dueFees.map((f: any) => f.due_date)
        };
      }));

      res.json(report.filter((s: any) => s.totalDue > 0));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate due report" });
    }
  });

  // --- Slider Images ---
  // Slider images removed

  // --- Showcase Items ---
  app.get("/api/showcase-items", async (req, res) => {
    try {
      const db = getFirestoreInstance();
      const itemsSnapshot = await db.collection("showcase_items").get();
      const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch showcase items" });
    }
  });

  app.post("/api/admin/showcase-items", async (req, res) => {
    const { title, description, url, type } = req.body;
    try {
      const db = getFirestoreInstance();
      await db.collection("showcase_items").add({ title, description, url, type, created_at: new Date().toISOString() });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add showcase item" });
    }
  });

  app.delete("/api/admin/showcase-items/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      const db = getFirestoreInstance();
      await db.collection("showcase_items").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete showcase item" });
    }
  });

  // --- Site Settings ---

  app.get("/api/site-settings", async (req, res) => {
    console.log("Fetching site settings...");
    try {
      const db = getFirestoreInstance();
      if (!db) throw new Error("Firestore not initialized");

      // Add a timeout to firestore call
      const settingsPromise = db.collection("site_settings").doc("1").get();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Firestore timeout")), 10000)
      );
      
      const settingsDoc = await Promise.race([settingsPromise, timeoutPromise]) as admin.firestore.DocumentSnapshot;
      
      console.log("Site settings fetched successfully. Exists:", settingsDoc.exists);
      res.json(settingsDoc.exists ? { id: settingsDoc.id, ...settingsDoc.data() } : {});
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ error: "Failed to fetch settings", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/site-settings", async (req, res) => {
    const { 
      title, description, hero_image, logo_url, contact_phone, 
      whatsapp_number, facebook_url, announcement, bkash_number, 
      nagad_number, rocket_number, enable_bkash, enable_nagad, enable_rocket, enable_recruitment, address,
      smtp_host, smtp_port, smtp_user, smtp_pass, sender_email,
      firebase_service_account,
      udyoktapay_api_key, udyoktapay_api_url,
      show_features_directly, show_food_directly, show_showcase_directly, showcase_content,
      admission_rules,
      enable_neon_light, neon_light_color, neon_light_effect,
      admin_password,
      youtube_url, muhtamim_signature_url, show_muhtamim_signature,
      qr_code_url, enable_qr_code, auto_whatsapp, enable_historical_reports,
      show_routines_directly, bkash_instructions, nagad_instructions, rocket_instructions,
      payment_special_note, enable_signature, signature_url
    } = req.body;
    try {
      const db = getFirestoreInstance();
      await db.collection("site_settings").doc("1").set({
        title: title || "", description: description || "", hero_image: hero_image || "", logo_url: logo_url || "", contact_phone: contact_phone || "", 
        whatsapp_number: whatsapp_number || "", facebook_url: facebook_url || "", announcement: announcement || "", bkash_number: bkash_number || "", 
        nagad_number: nagad_number || "", rocket_number: rocket_number || "",
        enable_bkash: enable_bkash ? 1 : 0, enable_nagad: enable_nagad ? 1 : 0, enable_rocket: enable_rocket ? 1 : 0,
        enable_recruitment: enable_recruitment ? 1 : 0, address: address || "",
        smtp_host: smtp_host || "", smtp_port: smtp_port || "", smtp_user: smtp_user || "", smtp_pass: smtp_pass || "", sender_email: sender_email || "",
        firebase_service_account: firebase_service_account || "",
        udyoktapay_api_key: udyoktapay_api_key || "",
        udyoktapay_api_url: udyoktapay_api_url || "",
        show_features_directly: show_features_directly ? 1 : 0, 
        show_food_directly: show_food_directly ? 1 : 0, 
        show_showcase_directly: show_showcase_directly ? 1 : 0, 
        showcase_content: showcase_content || '[]',
        admission_rules: admission_rules || "",
        enable_neon_light: enable_neon_light ? 1 : 0,
        neon_light_color: neon_light_color || "#10b981",
        neon_light_effect: neon_light_effect || "pulse",
        admin_password: admin_password || "",
        youtube_url: youtube_url || "",
        muhtamim_signature_url: muhtamim_signature_url || "",
        show_muhtamim_signature: show_muhtamim_signature ? 1 : 0,
        qr_code_url: qr_code_url || "",
        enable_qr_code: enable_qr_code ? 1 : 0,
        auto_whatsapp: auto_whatsapp ? 1 : 0,
        enable_historical_reports: enable_historical_reports ? 1 : 0,
        show_routines_directly: show_routines_directly ? 1 : 0,
        bkash_instructions: bkash_instructions || "",
        nagad_instructions: nagad_instructions || "",
        rocket_instructions: rocket_instructions || "",
        payment_special_note: payment_special_note || "",
        enable_signature: enable_signature ? 1 : 0,
        signature_url: signature_url || ""
      }, { merge: true });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // --- Recruitment ---
  app.get("/api/admin/job-applications", async (req, res) => {
    try {
      const appsSnapshot = await firestore!.collection("job_applications").orderBy("applied_date", "desc").get();
      const apps = appsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(apps);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch job applications" });
    }
  });

  app.post("/api/job-applications", async (req, res) => {
    const { name, phone, email, cv_url } = req.body;
    try {
      await firestore!.collection("job_applications").add({ name, phone, email, cv_url, status: 'pending', applied_date: new Date().toISOString() });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add job application" });
    }
  });

  // --- Food Menu ---
  app.get("/api/food-menu", async (req, res) => {
    try {
      const db = getFirestoreInstance();
      if (!db) return res.status(500).json({ error: "Firestore not initialized" });
      const foodMenuSnapshot = await db.collection("food_menu").get();
      const foodMenu = foodMenuSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() as any }))
        .filter(item => item.is_active === 1)
        .sort((a, b) => parseRoll(a.serial) - parseRoll(b.serial));
      res.json(foodMenu);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch food menu" });
    }
  });

  app.post("/api/admin/food-menu", async (req, res) => {
    const { title, description, image_url, is_active, serial } = req.body;
    try {
      const db = getFirestoreInstance();
      if (!db) return res.status(500).json({ error: "Firestore not initialized" });
      await db.collection("food_menu").add({ 
        title, 
        description, 
        image_url, 
        serial: serial || null,
        date: new Date().toISOString(),
        is_active: is_active !== undefined ? Number(is_active) : 1
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add food menu" });
    }
  });

  app.delete("/api/admin/food-menu/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      await firestore!.collection("food_menu").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete food menu" });
    }
  });

  app.put("/api/admin/food-menu/:id", async (req, res) => {
    const { title, description, image_url, is_active, serial } = req.body;
    try {
      await firestore.collection("food_menu").doc(req.params.id).update({ 
        title, 
        description, 
        image_url,
        serial: serial !== undefined ? Number(serial) : 0,
        is_active: is_active !== undefined ? Number(is_active) : 1
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update food menu" });
    }
  });

  // --- Routine & Syllabus Management ---
  app.get("/api/routines", async (req, res) => {
    try {
      const db = getFirestoreInstance();
      const snapshot = await db.collection("routines").get();
      const routines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(routines);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch routines" });
    }
  });

  app.post("/api/admin/routines", async (req, res) => {
    try {
      const { title, link_url } = req.body;
      await firestore!.collection("routines").add({
        title,
        link_url,
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add routine" });
    }
  });

  app.put("/api/admin/routines/:id", async (req, res) => {
    try {
      const { title, link_url } = req.body;
      await firestore!.collection("routines").doc(req.params.id).update({
        title,
        link_url,
        updated_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update routine" });
    }
  });

  app.delete("/api/admin/routines/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      await firestore!.collection("routines").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete routine" });
    }
  });

  // --- Class Promotion ---
  app.post("/api/admin/promote-class", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) {
      return res.status(401).json({ error: "Invalid password" });
    }
    try {
      const classMap: {[key: string]: string} = {
        "১ম": "২য়",
        "২য়": "৩য়",
        "৩য়": "৪র্থ",
        "৪র্থ": "৫ম",
        "৫ম": "৬ষ্ঠ",
        "হিফজ": "হিফজ"
      };

      const studentsSnapshot = await firestore.collection("students").get();
      const batch = firestore.batch();
      
      studentsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!data.deleted_at) {
          const nextClass = classMap[data.class];
          if (nextClass) {
            batch.update(doc.ref, { class: nextClass });
          }
        }
      });
      
      await batch.commit();
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to promote students" });
    }
  });

  // --- Classes ---
  app.get("/api/classes", async (req, res) => {
    try {
      const snapshot = await firestore.collection("classes").orderBy("order").get();
      const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(classes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch classes" });
    }
  });

  app.post("/api/classes", async (req, res) => {
    const { name, order, password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      await firestore.collection("classes").add({ name, order: order || 0 });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add class" });
    }
  });

  app.put("/api/classes/:id", async (req, res) => {
    const { name, order, is_active, password } = req.body;
    
    // If updating name or order, require password
    if (name !== undefined || order !== undefined) {
      if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    }

    try {
      const classRef = firestore.collection("classes").doc(req.params.id);
      const classDoc = await classRef.get();
      if (!classDoc.exists) {
        return res.status(404).json({ error: "Class not found" });
      }
      const oldName = classDoc.data()?.name;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (order !== undefined) updateData.order = order;
      if (is_active !== undefined) updateData.is_active = is_active;
      
      await classRef.update(updateData);

      // If name changed, update related records
      if (name !== undefined && oldName && name !== oldName) {
        let batch = firestore.batch();
        let count = 0;

        const addUpdate = async (ref: any, data: any) => {
          batch.update(ref, data);
          count++;
          if (count >= 400) {
            await batch.commit();
            batch = firestore.batch();
            count = 0;
          }
        };

        const studentsSnap = await firestore.collection("students").where("class", "==", oldName).get();
        for (const doc of studentsSnap.docs) await addUpdate(doc.ref, { class: name });

        const subjectsSnap = await firestore.collection("subjects").where("class", "==", oldName).get();
        for (const doc of subjectsSnap.docs) await addUpdate(doc.ref, { class: name });

        const incomeSnap = await firestore.collection("income").where("class_name", "==", oldName).get();
        for (const doc of incomeSnap.docs) await addUpdate(doc.ref, { class_name: name });

        const expensesSnap = await firestore.collection("expenses").where("class_name", "==", oldName).get();
        for (const doc of expensesSnap.docs) await addUpdate(doc.ref, { class_name: name });
        
        if (count > 0) {
          await batch.commit();
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update class" });
    }
  });

  app.delete("/api/classes/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      await firestore.collection("classes").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete class" });
    }
  });

  // --- Sub Admins ---
  app.get("/api/sub-admins", async (req, res) => {
    try {
      const snapshot = await firestore.collection("sub_admins").get();
      const subAdmins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(subAdmins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sub-admins" });
    }
  });

  app.post("/api/sub-admins", async (req, res) => {
    const { email, permissions, password, subAdminPassword } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      await firestore.collection("sub_admins").add({ email, permissions, password: subAdminPassword });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add sub-admin" });
    }
  });

  app.put("/api/sub-admins/:id", async (req, res) => {
    const { email, permissions, password, subAdminPassword } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      const updateData: any = { email, permissions };
      if (subAdminPassword) updateData.password = subAdminPassword;
      await firestore.collection("sub_admins").doc(req.params.id).update(updateData);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update sub-admin" });
    }
  });

  app.delete("/api/sub-admins/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      await firestore.collection("sub_admins").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sub-admin" });
    }
  });

  app.post("/api/admin-login", async (req, res) => {
    const { identifier } = req.body;
    const adminPassword = process.env.VITE_ADMIN_PASSWORD || "1234";
    
    if (identifier === adminPassword || identifier === "১২৩৪") {
      return res.json({ success: true, role: "admin", permissions: ["all"] });
    }

    try {
      const snapshot = await firestore.collection("sub_admins").where("email", "==", identifier).get();
      if (!snapshot.empty) {
        const subAdmin = snapshot.docs[0].data();
        return res.json({ success: true, role: "sub_admin", permissions: subAdmin.permissions });
      }
      res.status(401).json({ error: "ভুল পাসওয়ার্ড বা ইমেইল!" });
    } catch (error) {
      res.status(500).json({ error: "লগইন করতে সমস্যা হয়েছে" });
    }
  });

  // --- Teachers ---
  app.get("/api/admin/teachers", async (req, res) => {
    try {
      const teachersSnapshot = await firestore!.collection("teachers").get();
      const teachers = teachersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((t: any) => t.deleted_at === null || t.deleted_at === undefined);
      res.json(teachers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch teachers" });
    }
  });

  app.get("/api/admin/archive/teachers", async (req, res) => {
    try {
      const teachersSnapshot = await firestore!.collection("teachers").where("deleted_at", "!=", null).get();
      const teachers = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(teachers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch archived teachers" });
    }
  });

  app.post("/api/admin/teachers", async (req, res) => {
    const data = req.body;
    try {
      const docRef = await firestore!.collection("teachers").add({ 
        name: data.name || "",
        type: data.type || "teacher",
        address: data.address || "",
        qualification: data.qualification || "",
        photo_url: data.photo_url || "",
        salary: data.salary || 0,
        phone: data.phone || "",
        email: data.email || "",
        dob: data.dob || "",
        join_date: data.join_date || "",
        nid: data.nid || "",
        id_code: data.id_code || "",
        father_name: data.father_name || "",
        mother_name: data.mother_name || "",
        parents_nid: data.parents_nid || "",
        biodata: data.biodata || "",
        biometric_id: data.biometric_id || null, 
        created_at: new Date().toISOString(),
        deleted_at: null
      });
      res.json({ success: true });
    } catch (e) {
      console.error("Error adding teacher:", e);
      res.status(500).json({ error: "Failed to add teacher" });
    }
  });

  app.put("/api/admin/teachers/:id", async (req, res) => {
    const data = req.body;
    try {
      await firestore.collection("teachers").doc(req.params.id).update({ 
        name: data.name || "",
        type: data.type || "teacher",
        address: data.address || "",
        qualification: data.qualification || "",
        photo_url: data.photo_url || "",
        salary: data.salary || 0,
        phone: data.phone || "",
        email: data.email || "",
        dob: data.dob || "",
        join_date: data.join_date || "",
        nid: data.nid || "",
        id_code: data.id_code || "",
        father_name: data.father_name || "",
        mother_name: data.mother_name || "",
        parents_nid: data.parents_nid || "",
        biodata: data.biodata || "",
        biometric_id: data.biometric_id || null,
        updated_at: new Date().toISOString() 
      });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update teacher" });
    }
  });

  app.get("/api/admin/teacher-attendance", async (req, res) => {
    const { date } = req.query;
    try {
      const teachersSnapshot = await firestore.collection("teachers").get();
      const teachers = teachersSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      
      const attendanceSnapshot = await firestore.collection("teacher_attendance").where("date", "==", date).get();
      const attendance = attendanceSnapshot.docs.map(doc => doc.data());
      
      const result = teachers.map((t: any) => ({
        ...t,
        status: attendance.find((a: any) => a.teacher_id === t.id)?.status || null
      }));
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teacher attendance" });
    }
  });

  app.post("/api/admin/teacher-attendance/bulk", async (req, res) => {
    const { date, records } = req.body;
    try {
      const batch = firestore.batch();
      for (const record of records) {
        const docRef = firestore.collection("teacher_attendance").doc(`${record.teacher_id}_${date}`);
        if (record.status) {
          batch.set(docRef, { teacher_id: record.teacher_id, date, status: record.status });
        } else {
          batch.delete(docRef);
        }
      }
      await batch.commit();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save teacher attendance" });
    }
  });

  app.delete("/api/admin/teachers/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      const teacherDoc = await firestore.collection("teachers").doc(req.params.id).get();
      if (teacherDoc.exists) {
        await firestore.collection("delete_history").add({
          type: 'teacher',
          details: JSON.stringify({ id: teacherDoc.id, ...teacherDoc.data() }),
          deleted_at: new Date().toISOString()
        });
        await firestore.collection("teachers").doc(req.params.id).update({
          deleted_at: new Date().toISOString()
        });
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to archive teacher" });
    }
  });

  app.delete("/api/admin/teachers/salary/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      const salaryDoc = await firestore.collection("teacher_salaries").doc(req.params.id).get();
      if (salaryDoc.exists) {
        await firestore.collection("delete_history").add({
          type: 'teacher_salary',
          details: JSON.stringify({ id: salaryDoc.id, ...salaryDoc.data() }),
          deleted_at: new Date().toISOString()
        });
        await firestore.collection("teacher_salaries").doc(req.params.id).delete();
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete salary record" });
    }
  });

  app.put("/api/admin/teachers/salary/:id", async (req, res) => {
    const { amount, given_by, month, year } = req.body;
    try {
      const salaryDoc = await firestore.collection("teacher_salaries").doc(req.params.id).get();
      if (!salaryDoc.exists) return res.status(404).json({ error: "Salary not found" });
      
      const oldData = salaryDoc.data();
      
      const updateData: any = {
        amount: Number(amount),
        given_by: given_by || null,
        month,
        year: Number(year),
        is_edited: true,
        edit_history: [
          ...(oldData?.edit_history || []),
          {
            edited_at: new Date().toISOString(),
            changes: `Amount: ${oldData?.amount} -> ${amount}, Month: ${oldData?.month} -> ${month}, Year: ${oldData?.year} -> ${year}, Given By: ${oldData?.given_by} -> ${given_by}`
          }
        ]
      };

      await firestore.collection("teacher_salaries").doc(req.params.id).update(updateData);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update salary:", error);
      res.status(500).json({ error: "Failed to update salary" });
    }
  });

  app.use((req, res, next) => {
    if (!firestore) {
      getFirestoreInstance();
    }
    next();
  });

  app.get("/api/admin/accounting/income-categories", async (req, res) => {
    try {
      const snapshot = await firestore.collection("income_categories").get();
      const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch income categories" });
    }
  });

  app.post("/api/admin/accounting/income-categories", async (req, res) => {
    const { name, password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      const docRef = await firestore.collection("income_categories").add({ name, is_hidden: false });
      res.json({ id: docRef.id, name, is_hidden: false });
    } catch (error) {
      res.status(500).json({ error: "Failed to add income category" });
    }
  });

  app.put("/api/admin/accounting/income-categories/:id", async (req, res) => {
    const { name, is_hidden, password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      const docRef = firestore.collection("income_categories").doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).json({ error: "Category not found" });
      
      const oldData = doc.data();
      await docRef.update({ name, is_hidden });

      if (name && oldData?.name && name !== oldData.name) {
        const incomeSnapshot = await firestore.collection("income").where("category", "==", oldData.name).get();
        const docs = incomeSnapshot.docs;
        for (let i = 0; i < docs.length; i += 500) {
          const batch = firestore.batch();
          docs.slice(i, i + 500).forEach(d => {
            batch.update(d.ref, { category: name });
          });
          await batch.commit();
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update income category" });
    }
  });

  app.delete("/api/admin/accounting/income-categories/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      await firestore.collection("income_categories").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete income category" });
    }
  });

  app.get("/api/admin/accounting/expense-categories", async (req, res) => {
    try {
      const snapshot = await firestore.collection("expense_categories").get();
      const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense categories" });
    }
  });

  app.post("/api/admin/accounting/expense-categories", async (req, res) => {
    const { name, password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      const docRef = await firestore.collection("expense_categories").add({ name, is_hidden: false });
      res.json({ id: docRef.id, name, is_hidden: false });
    } catch (error) {
      res.status(500).json({ error: "Failed to add expense category" });
    }
  });

  app.put("/api/admin/accounting/expense-categories/:id", async (req, res) => {
    const { name, is_hidden, password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      const docRef = firestore.collection("expense_categories").doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).json({ error: "Category not found" });
      
      const oldData = doc.data();
      await docRef.update({ name, is_hidden });

      if (name && oldData?.name && name !== oldData.name) {
        const expenseSnapshot = await firestore.collection("expenses").where("category", "==", oldData.name).get();
        const docs = expenseSnapshot.docs;
        for (let i = 0; i < docs.length; i += 500) {
          const batch = firestore.batch();
          docs.slice(i, i + 500).forEach(d => {
            batch.update(d.ref, { category: name });
          });
          await batch.commit();
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update expense category" });
    }
  });

  app.delete("/api/admin/accounting/expense-categories/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      await firestore.collection("expense_categories").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense category" });
    }
  });

  app.get("/api/admin/accounting/reports/category", async (req, res) => {
    const { month, category, start_date, end_date, class_name } = req.query;
    try {
      let incomeQuery: any = firestore.collection("income");
      let expenseQuery: any = firestore.collection("expenses");
      let feesQuery: any = firestore.collection("fees").where("status", "==", "paid");

      if (class_name) {
        incomeQuery = incomeQuery.where("class_name", "==", class_name);
        expenseQuery = expenseQuery.where("class_name", "==", class_name);
        feesQuery = feesQuery.where("class_name", "==", class_name);
      }

      if (category) {
        incomeQuery = incomeQuery.where("category", "==", category);
        expenseQuery = expenseQuery.where("category", "==", category);
        feesQuery = feesQuery.where("category", "==", category);
      }

      const [incomeSnap, expenseSnap] = await Promise.all([
        incomeQuery.get(),
        expenseQuery.get()
      ]);

      const filterByDate = (data: any, dateField: string) => {
        if (start_date && end_date) {
          return data.filter((item: any) => item[dateField] >= start_date && item[dateField] <= end_date + "T23:59:59.999Z");
        } else if (month) {
          const startDate = `${month}-01`;
          const endDate = `${month}-31T23:59:59.999Z`;
          return data.filter((item: any) => item[dateField] >= startDate && item[dateField] <= endDate);
        }
        return data;
      };

      let incomeData = filterByDate(incomeSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })), "date");
      let expenseData = filterByDate(expenseSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })), "date");
      
      let feesSnapshot: any = { docs: [] };
      if (class_name) {
        const studentsSnapshot = await firestore.collection("students").where("class", "==", class_name).get();
        const studentIds = studentsSnapshot.docs.map(doc => doc.id);
        if (studentIds.length > 0) {
          const chunks = [];
          for (let i = 0; i < studentIds.length; i += 30) chunks.push(studentIds.slice(i, i + 30));
          const feePromises = chunks.map(chunk => {
            let q = firestore.collection("fees").where("status", "==", "paid").where("student_id", "in", chunk);
            if (category) q = q.where("category", "==", category);
            return q.get();
          });
          const snaps = await Promise.all(feePromises);
          feesSnapshot = { docs: snaps.flatMap(s => s.docs) };
        }
      } else {
        feesSnapshot = await feesQuery.get();
      }

      let feeData = filterByDate(feesSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })), "paid_date");

      incomeData = [...incomeData, ...feeData];

      res.json({ income: incomeData, expenses: expenseData });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch category report" });
    }
  });

  app.get("/api/admin/accounting/reports/class", async (req, res) => {
    const { class_name, start_date, end_date } = req.query;
    try {
      let incomeQuery: any = firestore.collection("income");
      let expenseQuery: any = firestore.collection("expenses");

      if (class_name) {
        incomeQuery = incomeQuery.where("class_name", "==", class_name);
        expenseQuery = expenseQuery.where("class_name", "==", class_name);
      }

      const [incomeSnapshot, expenseSnapshot] = await Promise.all([
        incomeQuery.get(),
        expenseQuery.get()
      ]);

      const filterByDate = (data: any, dateField: string) => {
        if (start_date && end_date) {
          return data.filter((item: any) => item[dateField] >= start_date && item[dateField] <= end_date + "T23:59:59.999Z");
        }
        return data;
      };

      const incomeData = filterByDate(incomeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })), "date");
      let expenseData = filterByDate(expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })), "date");

      // Exclude teacher salaries from class reports as requested by user
      if (class_name) {
        expenseData = expenseData.filter((item: any) => {
          const category = (item.category || "").toLowerCase();
          return !category.includes("teacher salary") && !category.includes("শিক্ষক") && !category.includes("বেতন");
        });
      }

      let feesData: any[] = [];
      if (class_name) {
        const studentsSnapshot = await firestore.collection("students").where("class", "==", class_name).get();
        const studentIds = studentsSnapshot.docs.map(doc => doc.id);
        
        if (studentIds.length > 0) {
          const chunks = [];
          for (let i = 0; i < studentIds.length; i += 30) chunks.push(studentIds.slice(i, i + 30));
          
          const feePromises = chunks.map(chunk => {
            return firestore.collection("fees").where("student_id", "in", chunk).get();
          });
          
          const feeSnapshots = await Promise.all(feePromises);
          feeSnapshots.forEach(snap => {
            snap.docs.forEach(doc => {
              feesData.push({ id: doc.id, ...doc.data() });
            });
          });
        }
      } else {
        const feesSnapshot = await firestore.collection("fees").get();
        feesData = feesSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }

      const filteredFees = filterByDate(feesData, "paid_date");

      res.json({ fees: filteredFees, income: incomeData, expenses: expenseData });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch class report" });
    }
  });

  app.get("/api/admin/accounting/summary", async (req, res) => {
    const { start_date, end_date, class_name } = req.query;
    try {
      let feesQuery: any = firestore.collection("fees").where("status", "==", "paid");
      let incomeQuery: any = firestore.collection("income");
      let expenseQuery: any = firestore.collection("expenses");

      if (class_name) {
        incomeQuery = incomeQuery.where("class_name", "==", class_name);
        expenseQuery = expenseQuery.where("class_name", "==", class_name);
      }

      let feesSnapshot: any = { docs: [] };
      if (class_name) {
        const studentsSnapshot = await firestore.collection("students").where("class", "==", class_name).get();
        const studentIds = studentsSnapshot.docs.map(doc => doc.id);
        if (studentIds.length > 0) {
          const chunks = [];
          for (let i = 0; i < studentIds.length; i += 30) chunks.push(studentIds.slice(i, i + 30));
          const feePromises = chunks.map(chunk => {
            return firestore.collection("fees").where("status", "==", "paid").where("student_id", "in", chunk).get();
          });
          const snaps = await Promise.all(feePromises);
          feesSnapshot = { docs: snaps.flatMap(s => s.docs) };
        }
      } else {
        feesSnapshot = await feesQuery.get();
      }

      const [incomeSnapshot, expenseSnapshot] = await Promise.all([
        incomeQuery.get(),
        expenseQuery.get()
      ]);

      const filterByDate = (data: any, dateField: string, start: any, end: any) => {
        return data.filter((item: any) => {
          const date = item[dateField];
          if (!date) return false;
          if (start && date < start) return false;
          if (end && date > end + "T23:59:59.999Z") return false;
          return true;
        });
      };

      const feeDocs = filterByDate(feesSnapshot.docs.map(doc => doc.data()), "paid_date", start_date, end_date);
      const incomeDocs = filterByDate(incomeSnapshot.docs.map(doc => doc.data()), "date", start_date, end_date);
      const expenseDocs = filterByDate(expenseSnapshot.docs.map(doc => doc.data()), "date", start_date, end_date);

      const feeIncome = feeDocs.reduce((sum: number, data: any) => sum + (data.amount || 0), 0);
      const otherIncome = incomeDocs.reduce((sum: number, data: any) => sum + (data.amount || 0), 0);
      const totalIncome = feeIncome + otherIncome;
      const totalExpense = expenseDocs.reduce((sum: number, data: any) => sum + (data.amount || 0), 0);

      // Previous Balance Calculation
      let prevBalance = 0;
      let prevIncome = 0;
      let prevExpense = 0;
      if (start_date) {
        let prevFeesQuery = firestore.collection("fees").where("status", "==", "paid");
        let prevIncQuery = firestore.collection("income");
        let prevExpQuery = firestore.collection("expenses");

        if (class_name) {
          prevFeesQuery = prevFeesQuery.where("class_name", "==", class_name);
          prevIncQuery = prevIncQuery.where("class_name", "==", class_name);
          prevExpQuery = prevExpQuery.where("class_name", "==", class_name);
        }

        const [prevFees, prevInc, prevExp] = await Promise.all([
          prevFeesQuery.get(),
          prevIncQuery.get(),
          prevExpQuery.get()
        ]);
        
        const pfDocs = filterByDate(prevFees.docs.map(doc => doc.data()), "paid_date", null, start_date ? new Date(new Date(start_date as string).getTime() - 1).toISOString().split('T')[0] : null);
        const piDocs = filterByDate(prevInc.docs.map(doc => doc.data()), "date", null, start_date ? new Date(new Date(start_date as string).getTime() - 1).toISOString().split('T')[0] : null);
        const peDocs = filterByDate(prevExp.docs.map(doc => doc.data()), "date", null, start_date ? new Date(new Date(start_date as string).getTime() - 1).toISOString().split('T')[0] : null);

        const pf = pfDocs.reduce((sum: number, data: any) => sum + (data.amount || 0), 0);
        const pi = piDocs.reduce((sum: number, data: any) => sum + (data.amount || 0), 0);
        const pe = peDocs.reduce((sum: number, data: any) => sum + (data.amount || 0), 0);
        
        prevIncome = pf + pi;
        prevExpense = pe;
        prevBalance = prevIncome - prevExpense;
      }

      res.json({ 
        totalIncome, 
        feeIncome,
        otherIncome,
        totalExpense, 
        balance: totalIncome - totalExpense,
        prevBalance,
        prevIncome,
        prevExpense,
        totalBalance: prevBalance + (totalIncome - totalExpense)
      });
    } catch (error) {
      console.error("Accounting summary error:", error);
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  });

  app.get("/api/admin/accounting/income", async (req, res) => {
    const { start_date, end_date, limit = 50, offset = 0, search, class_name } = req.query;
    try {
      let feesQuery: any = firestore.collection("fees").where("status", "==", "paid");
      let incomeQuery: any = firestore.collection("income");

      if (start_date) {
        feesQuery = feesQuery.where("paid_date", ">=", start_date);
        incomeQuery = incomeQuery.where("date", ">=", start_date);
      }
      if (end_date) {
        feesQuery = feesQuery.where("paid_date", "<=", end_date + "T23:59:59.999Z");
        incomeQuery = incomeQuery.where("date", "<=", end_date + "T23:59:59.999Z");
      }
      if (class_name) {
        incomeQuery = incomeQuery.where("class_name", "==", class_name);
      }

      let feesSnapshot: any = { docs: [] };
      if (class_name) {
        const studentsSnapshot = await firestore.collection("students").where("class", "==", class_name).get();
        const studentIds = studentsSnapshot.docs.map(doc => doc.id);
        if (studentIds.length > 0) {
          const chunks = [];
          for (let i = 0; i < studentIds.length; i += 30) chunks.push(studentIds.slice(i, i + 30));
          const feePromises = chunks.map(chunk => {
            let q = firestore.collection("fees").where("status", "==", "paid").where("student_id", "in", chunk);
            if (start_date) q = q.where("paid_date", ">=", start_date);
            if (end_date) q = q.where("paid_date", "<=", end_date + "T23:59:59.999Z");
            return q.get();
          });
          const snaps = await Promise.all(feePromises);
          feesSnapshot = { docs: snaps.flatMap(s => s.docs) };
        }
      } else {
        feesSnapshot = await feesQuery.get();
      }

      const incomeSnapshot = await incomeQuery.get();

      const feeIncome = feesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data(), type: 'Fee' } as any));
      const otherIncome = incomeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Other' } as any));

      let allIncome = [...feeIncome, ...otherIncome];
      
      if (search) {
        const s = (search as string).toLowerCase();
        allIncome = allIncome.filter(item => 
          (item.category && item.category.toLowerCase().includes(s)) ||
          (item.student_name && item.student_name.toLowerCase().includes(s)) ||
          item.id.toLowerCase().includes(s)
        );
      }

      allIncome.sort((a, b) => {
        const dateA = a.paid_date || a.date;
        const dateB = b.paid_date || b.date;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      const paginatedIncome = allIncome.slice(Number(offset), Number(offset) + Number(limit));

      res.json({
        data: paginatedIncome,
        total: allIncome.length,
        hasMore: Number(offset) + Number(limit) < allIncome.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch income" });
    }
  });

  app.post("/api/admin/accounting/income", async (req, res) => {
    const { category, description, amount, date, purpose, class_name } = req.body;
    try {
      const transaction_id = await getNextSerial("INC");
      await firestore.collection("income").add({
        transaction_id,
        category,
        description,
        amount: Number(amount),
        date: date || new Date().toISOString(),
        purpose,
        class_name: class_name || null
      });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to add income" });
    }
  });

  app.delete("/api/admin/accounting/income/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      const incomeDoc = await firestore.collection("income").doc(req.params.id).get();
      if (incomeDoc.exists) {
        await firestore.collection("delete_history").add({
          type: 'income',
          details: JSON.stringify({ id: incomeDoc.id, ...incomeDoc.data() }),
          deleted_at: new Date().toISOString()
        });
        await firestore.collection("income").doc(req.params.id).delete();
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete income" });
    }
  });

  app.get("/api/admin/accounting/expenses", async (req, res) => {
    const { start_date, end_date, limit = 50, offset = 0, search, class_name } = req.query;
    try {
      let query: any = firestore.collection("expenses");
      if (start_date) {
        query = query.where("date", ">=", start_date);
      }
      if (end_date) {
        query = query.where("date", "<=", end_date + "T23:59:59.999Z");
      }
      if (class_name) {
        query = query.where("class_name", "==", class_name);
      }
      
      const snapshot = await query.orderBy("date", "desc").get();
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      if (search) {
        const s = (search as string).toLowerCase();
        data = data.filter(item => 
          (item.category && item.category.toLowerCase().includes(s)) ||
          item.id.toLowerCase().includes(s)
        );
      }

      const total = data.length;
      const paginatedData = data.slice(Number(offset), Number(offset) + Number(limit));

      res.json({
        data: paginatedData,
        total,
        hasMore: Number(offset) + Number(limit) < total
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/admin/accounting/expenses", async (req, res) => {
    const { category, description, amount, date, purpose, class_name } = req.body;
    try {
      const transaction_id = await getNextSerial("EXP");
      await firestore.collection("expenses").add({
        transaction_id,
        category,
        description,
        amount: Number(amount),
        date: date || new Date().toISOString(),
        purpose,
        class_name: class_name || null
      });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to add expense" });
    }
  });

  app.delete("/api/admin/accounting/expenses/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      const expenseDoc = await firestore.collection("expenses").doc(req.params.id).get();
      if (expenseDoc.exists) {
        await firestore.collection("delete_history").add({
          type: 'expense',
          details: JSON.stringify({ id: expenseDoc.id, ...expenseDoc.data() }),
          deleted_at: new Date().toISOString()
        });
        await firestore.collection("expenses").doc(req.params.id).delete();
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  app.post("/api/admin/teachers/:id/salary", async (req, res) => {
    const { amount, month, year, given_by } = req.body;
    const teacherId = req.params.id;
    try {
      const teacherDoc = await firestore.collection("teachers").doc(teacherId).get();
      if (!teacherDoc.exists) return res.status(404).json({ error: "Teacher not found" });
      const teacher = teacherDoc.data();

      const batch = firestore.batch();
      const salaryRef = firestore.collection("teacher_salaries").doc();
      batch.set(salaryRef, {
        teacher_id: teacherId,
        amount: Number(amount),
        total_salary: teacher.salary || 0,
        due_amount: (teacher.salary || 0) - Number(amount),
        month,
        year: Number(year),
        given_by: given_by || null,
        date: new Date().toISOString()
      });

      const expenseRef = firestore.collection("expenses").doc();
      batch.set(expenseRef, {
        category: "শিক্ষক বেতন",
        description: `${teacher?.name} এর ${month} ${year} মাসের বেতন`,
        amount: Number(amount),
        date: new Date().toISOString()
      });

      await batch.commit();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to pay salary" });
    }
  });

  app.get("/api/admin/teachers/:id/salaries", async (req, res) => {
    try {
      const salariesSnapshot = await firestore.collection("teacher_salaries")
        .where("teacher_id", "==", req.params.id)
        .get();
      const salaries = salariesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      salaries.sort((a: any, b: any) => new Date(b.date || b.created_at || 0).getTime() - new Date(a.date || a.created_at || 0).getTime());
      res.json(salaries);
    } catch (error) {
      console.error("Failed to fetch salaries:", error);
      res.status(500).json({ error: "Failed to fetch salaries" });
    }
  });

  // --- Fees Management ---
  app.post("/api/admin/fees/bulk-create", async (req, res) => {
    const { name, amount, classAmounts, className } = req.body;
    
    try {
      let studentsQuery = firestore.collection("students").where("deleted_at", "==", null);
      
      if (className && className !== "All") {
        studentsQuery = studentsQuery.where("class", "==", className);
      }
      
      const studentsSnapshot = await studentsQuery.get();
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const setupRef = firestore.collection("fee_setups").doc();
      const batches = [];
      let currentBatch = firestore.batch();
      let operationsCount = 0;

      currentBatch.set(setupRef, {
        name,
        type: 'exam',
        className,
        amount: Number(amount),
        month: null,
        created_at: new Date().toISOString()
      });
      operationsCount++;

      for (const student of students as any[]) {
        let feeAmount = amount;
        if (classAmounts && classAmounts[student.class]) {
          feeAmount = Number(classAmounts[student.class]);
        }

        const category = name;
        const feeRef = firestore.collection("fees").doc();
        currentBatch.set(feeRef, {
          student_id: student.id,
          category,
          amount: Number(feeAmount),
          due_date: new Date().toISOString().split('T')[0],
          status: 'unpaid',
          setup_id: setupRef.id,
          created_at: new Date().toISOString()
        });
        
        operationsCount++;
        if (operationsCount >= 400) {
          batches.push(currentBatch.commit());
          currentBatch = firestore.batch();
          operationsCount = 0;
        }
      }
      
      if (operationsCount > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);
      res.json({ success: true, count: students.length });
    } catch (error) {
      console.error("Bulk fee creation error:", error);
      res.status(500).json({ error: "Failed to create fees" });
    }
  });

  app.get("/api/admin/fee-setups", async (req, res) => {
    try {
      const snapshot = await firestore.collection("fee_setups").orderBy("created_at", "desc").get();
      const setups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      res.json(setups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fee setups" });
    }
  });

  app.get("/api/admin/fee-setups/:id/status", async (req, res) => {
    try {
      const setupId = req.params.id;
      const feesSnapshot = await firestore.collection("fees").where("setup_id", "==", setupId).get();
      const fees = feesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      const paid = fees.filter(f => f.status === 'paid');
      const unpaid = fees.filter(f => f.status === 'unpaid');

      res.json({
        total: fees.length,
        paidCount: paid.length,
        unpaidCount: unpaid.length,
        paidStudents: paid,
        unpaidStudents: unpaid
      });
    } catch (error) {
      console.error("Fee setup status error:", error);
      res.status(500).json({ error: "Failed to fetch status" });
    }
  });

  app.delete("/api/admin/fee-setups/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) return res.status(403).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" });

    const setupId = req.params.id;
    try {
      const setupDoc = await firestore.collection("fee_setups").doc(setupId).get();
      if (!setupDoc.exists) return res.status(404).json({ error: "Setup not found" });
      const setup = setupDoc.data();

      const batch = firestore.batch();
      batch.set(firestore.collection("delete_history").doc(), {
        type: 'fee_setup',
        details: JSON.stringify({ id: setupId, ...setup }),
        deleted_at: new Date().toISOString()
      });
      
      const feesSnapshot = await firestore.collection("fees").where("setup_id", "==", setupId).get();
      feesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      batch.delete(setupDoc.ref);
      
      await batch.commit();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete fee setup" });
    }
  });

  app.get("/api/admin/fees/search", async (req, res) => {
    const { search, className } = req.query;
    try {
      const feesSnapshot = await firestore.collection("fees").where("status", "==", "unpaid").get();
      const fees = feesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      const studentsSnapshot = await firestore.collection("students").get();
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      let results = fees.map(fee => {
        const student = students.find(s => s.id === fee.student_id);
        if (!student) return null;
        return {
          ...student,
          fee_id: fee.id,
          category: fee.category,
          amount: fee.amount,
          due_date: fee.due_date,
          status: fee.status
        };
      }).filter(r => r !== null) as any[];

      if (className && className !== "All") {
        results = results.filter(r => r.class === className);
      }

      if (search) {
        const s = (search as string).toLowerCase();
        results = results.filter(r => 
          (r.name && r.name.toLowerCase().includes(s)) ||
          (r.id && r.id.toLowerCase().includes(s)) ||
          (r.roll && r.roll.toString().includes(s))
        );
      }

      results.sort((a, b) => {
        if (a.class !== b.class) return (a.class || "").localeCompare(b.class || "");
        if (a.roll !== b.roll) {
          return parseRoll(a.roll) - parseRoll(b.roll);
        }
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });

      const grouped: any = {};
      results.forEach((row: any) => {
        if (!grouped[row.id]) {
          grouped[row.id] = {
            id: row.id,
            name: row.name,
            roll: row.roll,
            class: row.class,
            photo_url: row.photo_url,
            fees: []
          };
        }
        grouped[row.id].fees.push({
          id: row.fee_id,
          category: row.category,
          amount: row.amount,
          due_date: row.due_date
        });
      });

      res.json(Object.values(grouped));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to search fees" });
    }
  });

  app.post("/api/admin/fees/pay", async (req, res) => {
    const { fee_ids, paid_amounts, discount, total_paid, payment_method } = req.body;
    try {
      const db = getFirestoreInstance();
      if (!db) throw new Error("Firestore not initialized");
      const batch = db.batch();
      const transactionId = await getNextSerial("AHM");
      
      for (const id of fee_ids) {
        const amount = paid_amounts[id];
        const feeRef = db.collection("fees").doc(id);
        const updateData: any = {
          status: 'paid',
          paid_date: new Date().toISOString(),
          transaction_id: transactionId,
          payment_method: payment_method || "cash",
          discount_applied: (discount || 0) / fee_ids.length
        };
        if (amount) {
          updateData.paid_amount = Number(amount);
        }
        batch.update(feeRef, updateData);
      }
      await batch.commit();
      res.json({ success: true, transaction_id: transactionId });
    } catch (error) {
      console.error("Fee payment error:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });
  // --- Student & Admission ---
  app.get("/api/students", async (req, res) => {
    const { className, search, limit, offset, include_deleted } = req.query;
    try {
      let query: any = firestore.collection("students");
      if (include_deleted !== 'true') {
        query = query.where("deleted_at", "==", null);
      }
      if (className && className !== "All") {
        query = query.where("class", "==", className);
      }
      const snapshot = await query.get();
      let students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      if (search) {
        const s = (search as string).toLowerCase();
        students = students.filter(student => 
          (student.name && student.name.toLowerCase().includes(s)) ||
          (student.id && student.id.toLowerCase().includes(s)) ||
          (student.roll && student.roll.toString().includes(s))
        );
      }

      students.sort((a, b) => {
        if (a.class !== b.class) return (a.class || "").localeCompare(b.class || "");
        return parseRoll(a.roll) - parseRoll(b.roll);
      });

      if (limit) {
        const l = parseInt(limit as string);
        const o = offset ? parseInt(offset as string) : 0;
        students = students.slice(o, o + l);
      }

      res.json(students);
    } catch (error) {
      console.error("Error in /api/students:", error);
      res.status(500).json({ error: "Failed to fetch students", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const doc = await firestore.collection("students").doc(req.params.id).get();
      if (!doc.exists || doc.data()?.deleted_at) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student" });
    }
  });

  app.get("/api/students/:id/full-profile", async (req, res) => {
    const studentId = req.params.id;
    try {
      const studentDoc = await firestore.collection("students").doc(studentId).get();
      if (!studentDoc.exists) {
        return res.status(404).json({ error: "Student not found" });
      }
      const student = { id: studentDoc.id, ...studentDoc.data() } as any;

      const feesSnapshot = await firestore.collection("fees").where("student_id", "==", studentId).get();
      const fees = feesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      const attendanceSnapshot = await firestore.collection("attendance").where("student_id", "==", studentId).get();
      const attendance = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      const resultsSnapshot = await firestore.collection("results").where("student_id", "==", studentId).get();
      const results = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      const hifzSnapshot = await firestore.collection("hifz_records").where("student_id", "==", studentId).get();
      const hifz = hifzSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      // Calculate Rank
      let examStats: any = {};
      try {
        const exams = [...new Set(results.map((r: any) => `${r.exam_name}|${r.year || new Date().getFullYear().toString()}`))];
        for (const examKey of (exams as string[])) {
          const [exam, year] = examKey.split('|');
          const allExamResultsSnapshot = await firestore.collection("results")
            .where("exam_name", "==", exam)
            .where("class_name", "==", student.class)
            .where("year", "==", year)
            .get();
          const allExamResults = allExamResultsSnapshot.docs.map(doc => doc.data() as any);

          const studentTotals: any = {};
          allExamResults.forEach(r => {
            studentTotals[r.student_id] = (studentTotals[r.student_id] || 0) + r.marks;
          });

          const sortedTotals = Object.entries(studentTotals).map(([id, total]) => ({ student_id: id, total })).sort((a: any, b: any) => b.total - a.total);

          const myRankIndex = sortedTotals.findIndex(m => m.student_id === studentId);
          const myTotal = studentTotals[studentId] || 0;
          const highest = sortedTotals.length > 0 ? sortedTotals[0].total : 0;

          examStats[examKey] = {
            rank: myRankIndex !== -1 ? myRankIndex + 1 : '-',
            totalStudents: sortedTotals.length,
            highestMarks: highest,
            myTotal: myTotal
          };
        }
      } catch (e) {
        console.error("Rank calculation error:", e);
      }

      res.json({
        student,
        fees,
        attendance,
        results,
        hifz,
        examStats
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch full profile" });
    }
  });

  app.post("/api/admin/students", async (req, res) => {
    const { 
      name, name_en, father_name, father_name_en, mother_name, mother_name_en, 
      dob, blood_group, birth_cert_no, previous_school, present_address, permanent_address,
      phone, whatsapp, email, className, is_hifz, photo_url, roll: providedRoll, 
      monthly_fee, studentId: providedStudentId,
      guardian_name, guardian_relation, guardian_nid, guardian_mobile,
      interview_permissions,
      father_occupation, father_nid, mother_occupation, mother_nid,
      nationality, religion, gender
    } = req.body;
    
    if (!name || !className) {
      return res.status(400).json({ error: "নাম এবং শ্রেণী আবশ্যক" });
    }

    try {
      let roll = providedRoll;
      if (!roll) {
        const studentCountSnapshot = await firestore.collection("students").where("class", "==", className).get();
        roll = (studentCountSnapshot.size + 1).toString().padStart(3, '0');
      }
      
      let studentId = providedStudentId;
      if (!studentId) {
        const classMap: { [key: string]: string } = {
          "১ম": "1", "২য়": "2", "৩য়": "3", "৪র্থ": "4", "৫ম": "5", "হিফজ": "Hifz"
        };
        const classNumeric = classMap[className] || className;
        studentId = `AHM-${classNumeric}-${roll}`;
      }
      
      let studentCode = "";
      const lastStudentSnapshot = await firestore.collection("students").where("student_code", ">=", "AH").orderBy("student_code", "desc").limit(1).get();
      if (!lastStudentSnapshot.empty) {
        const lastStudent = lastStudentSnapshot.docs[0].data();
        const lastNum = parseInt(lastStudent.student_code.replace('AH', ''));
        studentCode = `AH${(lastNum + 1).toString().padStart(2, '0')}`;
      } else {
        studentCode = "AH01";
      }

      const existingDoc = await firestore.collection("students").doc(studentId).get();
      if (existingDoc.exists) {
        return res.status(400).json({ error: `এই আইডি (${studentId}) ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে অন্য আইডি চেষ্টা করুন।` });
      }

      const studentData = {
        studentId,
        roll,
        name,
        name_en,
        father_name,
        father_name_en,
        mother_name,
        mother_name_en,
        father_occupation,
        father_nid,
        mother_occupation,
        mother_nid,
        nationality,
        religion,
        gender,
        dob,
        blood_group,
        birth_cert_no,
        previous_school,
        present_address,
        permanent_address,
        phone,
        whatsapp,
        email,
        class: className,
        is_hifz: (is_hifz || className?.includes("হিফজ") || className?.includes("হেফজ")) ? 1 : 0,
        photo_url,
        monthly_fee: monthly_fee || 0,
        student_code: studentCode,
        biometric_id: req.body.biometric_id || null,
        guardian_name,
        guardian_relation,
        guardian_nid,
        guardian_mobile,
        interview_permissions: interview_permissions || [],
        deleted_at: null,
        created_at: new Date().toISOString()
      };

      await firestore.collection("students").doc(studentId).set(studentData);
      res.json({ success: true, studentId, roll, studentCode });
    } catch (error) {
      console.error("Student creation error:", error);
      res.status(500).json({ error: "ছাত্র যুক্ত করা সম্ভব হয়নি। ডাটাবেস এরর।" });
    }
  });

  app.put("/api/admin/students/:id", async (req, res) => {
    const { 
      name, name_en, father_name, father_name_en, mother_name, mother_name_en, 
      dob, blood_group, birth_cert_no, previous_school, present_address, permanent_address,
      phone, whatsapp, email, className, roll, is_hifz, photo_url, monthly_fee, 
      student_code, studentId,
      guardian_name, guardian_relation, guardian_nid, guardian_mobile,
      interview_permissions,
      father_occupation, father_nid, mother_occupation, mother_nid,
      nationality, religion, gender
    } = req.body;
    try {
      if (student_code) {
        const existingSnapshot = await firestore.collection("students").where("student_code", "==", student_code).get();
        const existing = existingSnapshot.docs.find(doc => doc.id !== req.params.id);
        if (existing) {
          return res.status(400).json({ error: "এই স্টুডেন্ট আইডি ইতিমধ্যে ব্যবহৃত হয়েছে।" });
        }
      }

      const updateData: any = {
        name, name_en, father_name, father_name_en, mother_name, mother_name_en,
        father_occupation, father_nid, mother_occupation, mother_nid,
        nationality, religion, gender,
        dob, blood_group, birth_cert_no, previous_school, present_address, permanent_address,
        phone, whatsapp, email, class: className, 
        roll, is_hifz: (is_hifz || className?.includes("হিফজ") || className?.includes("হেফজ")) ? 1 : 0, photo_url, 
        monthly_fee: monthly_fee || 0, student_code,
        biometric_id: req.body.biometric_id || null,
        guardian_name,
        guardian_relation,
        guardian_nid,
        guardian_mobile,
        interview_permissions: interview_permissions || [],
        updated_at: new Date().toISOString()
      };

      if (studentId) {
        const existingSnapshot = await firestore.collection("students").where("studentId", "==", studentId).get();
        const existing = existingSnapshot.docs.find(doc => doc.id !== req.params.id);
        if (existing) {
          return res.status(400).json({ error: "এই স্টুডেন্ট আইডি ইতিমধ্যে ব্যবহৃত হয়েছে।" });
        }
        updateData.studentId = studentId;
      }

      await firestore.collection("students").doc(req.params.id).update(updateData);
      res.json({ success: true });
    } catch (error) {
      console.error("Student update error:", error);
      res.status(500).json({ error: "ছাত্রের তথ্য আপডেট করা সম্ভব হয়নি।" });
    }
  });

  app.delete("/api/admin/students/:id", async (req, res) => {
    const { password } = req.body;
    const queryPassword = req.query.password as string;
    if (!(await verifyAdminOrSubAdmin(password || queryPassword, "all"))) {
      return res.status(401).json({ error: "Invalid password or permission denied" });
    }

    try {
      const studentDoc = await firestore.collection("students").doc(req.params.id).get();
      if (studentDoc.exists) {
        const student = studentDoc.data();
        await firestore.collection("delete_history").add({
          type: 'student',
          details: JSON.stringify({ id: studentDoc.id, ...student }),
          deleted_at: new Date().toISOString()
        });
        await firestore.collection("students").doc(req.params.id).update({
          deleted_at: new Date().toISOString()
        });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  app.post("/api/admission", async (req, res, next) => {
    try {
      const { 
        name, father_name, address, phone, previous_school, className
      } = req.body;
      
      await firestore.collection("admissions").add({
        name: name || "", 
        father_name: father_name || "", 
        address: address || "",
        phone: phone || "", 
        previous_school: previous_school || "",
        class: className || "১ম", 
        status: 'pending',
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/admissions", async (req, res) => {
    try {
      const snapshot = await firestore.collection("admissions").where("status", "==", "pending").get();
      const admissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      res.json(admissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admissions" });
    }
  });

  app.post("/api/admin/approve-admission", async (req, res) => {
    const { id, action } = req.body;
    try {
      if (action === 'reject') {
        await firestore.collection("admissions").doc(id).update({ status: 'rejected' });
        return res.json({ success: true });
      }

      const applicationDoc = await firestore.collection("admissions").doc(id).get();
      const application = applicationDoc.data();
      if (!application) return res.status(404).json({ error: "Application not found" });

      const className = application.class;
      const studentCountSnapshot = await firestore.collection("students").where("class", "==", className).get();
      const roll = (studentCountSnapshot.size + 1).toString().padStart(3, '0');
      const studentId = `AHM-${className}-${roll}`;
      const studentCode = Math.floor(100000 + Math.random() * 900000).toString();

      const studentData = {
        studentId,
        roll,
        name: application.name,
        name_en: application.name_en || "",
        father_name: application.father_name,
        father_name_en: application.father_name_en || "",
        mother_name: application.mother_name,
        mother_name_en: application.mother_name_en || "",
        father_occupation: application.father_occupation || "",
        father_nid: application.father_nid || "",
        mother_occupation: application.mother_occupation || "",
        mother_nid: application.mother_nid || "",
        nationality: application.nationality || "বাংলাদেশী",
        religion: application.religion || "ইসলাম",
        gender: application.gender || "বালক",
        dob: application.dob || "",
        blood_group: application.blood_group || "",
        birth_cert_no: application.birth_cert_no || "",
        previous_school: application.previous_school || "",
        present_address: application.address || application.present_address || "",
        permanent_address: application.address || application.permanent_address || "",
        phone: application.phone || "",
        whatsapp: application.whatsapp,
        email: application.email,
        class: className,
        is_hifz: application.is_hifz,
        photo_url: application.photo_url,
        monthly_fee: 0,
        student_code: studentCode,
        guardian_name: application.guardian_name || "",
        guardian_relation: application.guardian_relation || "",
        guardian_nid: application.guardian_nid || "",
        guardian_mobile: application.guardian_mobile || "",
        interview_permissions: application.interview_permissions || [],
        deleted_at: null,
        created_at: new Date().toISOString()
      };

      await firestore.collection("students").doc(studentId).set(studentData);
      await firestore.collection("admissions").doc(id).update({ status: 'approved' });

      res.json({ success: true, studentId, roll, studentCode });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve admission" });
    }
  });

  // Amal Endpoints
  app.get("/api/admin/amal-tasks", async (req, res) => {
    try {
      const snapshot = await firestore.collection("amal_tasks").get();
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch amal tasks" });
    }
  });

  app.post("/api/admin/amal-tasks", async (req, res) => {
    const { title, target, is_active } = req.body;
    try {
      const docRef = await firestore.collection("amal_tasks").add({
        title, target, is_active: is_active ?? true, created_at: new Date().toISOString()
      });
      res.json({ id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create amal task" });
    }
  });

  app.put("/api/admin/amal-tasks/:id", async (req, res) => {
    try {
      await firestore.collection("amal_tasks").doc(req.params.id).update(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update amal task" });
    }
  });

  app.delete("/api/admin/amal-tasks/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      await firestore.collection("amal_tasks").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete amal task" });
    }
  });

  app.get("/api/amal-tasks", async (req, res) => {
    const { target } = req.query;
    try {
      const snapshot = await firestore.collection("amal_tasks")
        .where("target", "==", target)
        .get();
      const tasks = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((task: any) => task.is_active === true);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch amal tasks" });
    }
  });

  app.post("/api/amal-logs", async (req, res) => {
    const { user_id, user_type, date, logs } = req.body; // logs: { task_id: status }
    try {
      const batch = firestore.batch();
      for (const [taskId, status] of Object.entries(logs)) {
        const logId = `${user_id}_${taskId}_${date}`;
        const logRef = firestore.collection("amal_logs").doc(logId);
        batch.set(logRef, {
          user_id, user_type, date, task_id: taskId, status, updated_at: new Date().toISOString()
        }, { merge: true });
      }
      await batch.commit();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save amal logs" });
    }
  });

  app.get("/api/amal-logs", async (req, res) => {
    const { user_id, date } = req.query;
    try {
      const snapshot = await firestore.collection("amal_logs")
        .where("user_id", "==", user_id)
        .get();
      const logs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((log: any) => log.date === date); // Filter in memory
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch amal logs" });
    }
  });

  app.get("/api/admin/amal-rankings", async (req, res) => {
    const { target, startDate, endDate } = req.query;
    try {
      // Get all users of this target type
      const usersSnapshot = await firestore.collection(target === 'student' ? 'students' : 'teachers').get();
      const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get active tasks count for this target
      const tasksSnapshot = await firestore.collection("amal_tasks")
        .where("target", "==", target)
        .get();
      const activeTasks = tasksSnapshot.docs.filter(doc => doc.data().is_active === true);
      const activeTasksCount = activeTasks.length || 1;

      // Calculate days in range
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const totalPossiblePerUser = activeTasksCount * days;

      const logsSnapshot = await firestore.collection("amal_logs")
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .get();
      
      const userStats: Record<string, { completed: number, logs: any[] }> = {};
      logsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.user_type !== target) return; // Filter in memory to avoid composite index
        
        if (!userStats[data.user_id]) {
          userStats[data.user_id] = { completed: 0, logs: [] };
        }
        if (data.status === "completed") userStats[data.user_id].completed++;
        userStats[data.user_id].logs.push({ id: doc.id, ...data });
      });

      const rankings = allUsers.map(user => {
        const stats = userStats[user.id] || { completed: 0, logs: [] };
        return {
          userId: user.id,
          name: (user as any).name || "Unknown",
          percentage: (stats.completed / totalPossiblePerUser) * 100,
          completed: stats.completed,
          total: totalPossiblePerUser,
          logs: stats.logs,
          submitted: stats.logs.length > 0
        };
      });

      rankings.sort((a, b) => b.percentage - a.percentage);
      res.json(rankings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch rankings" });
    }
  });

  app.get("/api/admin/amal-submission-status", async (req, res) => {
    const { date, target } = req.query;
    try {
      const usersSnapshot = await firestore.collection(target === 'student' ? 'students' : 'teachers').get();
      const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const logsSnapshot = await firestore.collection("amal_logs")
        .where("date", "==", date)
        .get();
      
      const userLogs: Record<string, any[]> = {};
      logsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.user_type !== target) return; // Filter in memory
        
        if (!userLogs[data.user_id]) userLogs[data.user_id] = [];
        userLogs[data.user_id].push({ id: doc.id, ...data });
      });

      const status = allUsers.map(user => ({
        userId: user.id,
        name: (user as any).name || "Unknown",
        submitted: !!userLogs[user.id],
        logs: userLogs[user.id] || []
      }));

      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch submission status" });
    }
  });

  app.get("/api/amal-rankings", async (req, res) => {
    const { target, startDate, endDate } = req.query;
    try {
      // Get active tasks count for this target
      const tasksSnapshot = await firestore.collection("amal_tasks")
        .where("target", "==", target)
        .get();
      const activeTasks = tasksSnapshot.docs.filter(doc => doc.data().is_active === true);
      const activeTasksCount = activeTasks.length || 1;

      // Calculate days in range
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const totalPossiblePerUser = activeTasksCount * days;

      const logsSnapshot = await firestore.collection("amal_logs")
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .get();
      
      const userStats: Record<string, { completed: number }> = {};
      logsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.user_type !== target) return; // Filter in memory
        if (data.task_id === "submission_record") return; // Ignore submission record
        
        if (!userStats[data.user_id]) {
          userStats[data.user_id] = { completed: 0 };
        }
        if (data.status === "completed") userStats[data.user_id].completed++;
      });

      const rankings = await Promise.all(Object.entries(userStats).map(async ([userId, stats]: [string, any]) => {
        const userDoc = await firestore.collection(target === 'student' ? 'students' : 'teachers').doc(userId).get();
        const userData = userDoc.data();
        return {
          userId,
          name: userData?.name || "Unknown",
          percentage: (stats.completed / totalPossiblePerUser) * 100,
          completed: stats.completed,
          total: totalPossiblePerUser
        };
      }));

      rankings.sort((a, b) => b.percentage - a.percentage);
      res.json(rankings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch rankings" });
    }
  });

  app.get("/api/teacher/salary-history/:id", async (req, res) => {
    try {
      const salariesSnapshot = await firestore.collection("teacher_salaries")
        .where("teacher_id", "==", req.params.id)
        .get();
      const salaries = salariesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      salaries.sort((a: any, b: any) => new Date(b.date || b.created_at || 0).getTime() - new Date(a.date || a.created_at || 0).getTime());
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salary history" });
    }
  });

  // Syllabus & Routine Endpoints
  app.get("/api/admin/syllabus-routines", async (req, res) => {
    try {
      const snapshot = await firestore.collection("syllabus_routines").get();
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch syllabus/routines" });
    }
  });

  app.post("/api/admin/syllabus-routines", async (req, res) => {
    const { title, link } = req.body;
    try {
      const docRef = await firestore.collection("syllabus_routines").add({
        title, link, created_at: new Date().toISOString()
      });
      res.json({ id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create syllabus/routine" });
    }
  });

  app.put("/api/admin/syllabus-routines/:id", async (req, res) => {
    try {
      await firestore.collection("syllabus_routines").doc(req.params.id).update(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update syllabus/routine" });
    }
  });

  app.delete("/api/admin/syllabus-routines/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      await firestore.collection("syllabus_routines").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete syllabus/routine" });
    }
  });

  app.get("/api/fees/:studentId", async (req, res) => {
    try {
      const snapshot = await firestore.collection("fees").where("student_id", "==", req.params.studentId).get();
      const fees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      res.json(fees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fees" });
    }
  });

  app.post("/api/admin/fees", async (req, res) => {
    const { student_id, category, amount, due_date } = req.body;
    try {
      await firestore.collection("fees").add({
        student_id,
        category,
        amount,
        due_date,
        status: 'unpaid',
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to create fee" });
    }
  });

  app.put("/api/admin/fees/:id/status", async (req, res) => {
    const { status, amount } = req.body;
    try {
      const updateData: any = { status };
      if (amount !== undefined) {
        updateData.amount = amount;
      }
      if (status === 'paid') {
        updateData.paid_date = new Date().toISOString();
      }
      await firestore.collection("fees").doc(req.params.id).update(updateData);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update fee status" });
    }
  });

  app.post("/api/pay-monthly-fees", async (req, res) => {
    const { student_id, student_name, year, months, total_amount, discount, transaction_id } = req.body;
    try {
      const batch = firestore.batch();
      const paid_date = new Date().toISOString();
      const amount_per_month = Math.round((total_amount + (discount || 0)) / months.length);
      const paid_amount_per_month = Math.round(total_amount / months.length);
      const discount_per_month = Math.round((discount || 0) / months.length);
      
      for (const month of months) {
        const docRef = firestore.collection("fees").doc();
        batch.set(docRef, {
          student_id,
          student_name,
          category: 'মাসিক বেতন',
          month,
          year,
          amount: amount_per_month,
          paid_amount: paid_amount_per_month,
          discount_applied: discount_per_month,
          status: 'paid',
          paid_date,
          transaction_id,
          created_at: paid_date
        });
      }
      await batch.commit();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Payment failed" });
    }
  });

  app.post("/api/pay-fee", async (req, res) => {
    const { feeId, transactionId } = req.body;
    try {
      await firestore.collection("fees").doc(feeId).update({
        status: 'paid',
        paid_date: new Date().toISOString(),
        transaction_id: transactionId
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Payment failed" });
    }
  });

  // --- Attendance ---
  app.post("/api/attendance", async (req, res) => {
    const { student_id, type, timestamp, device_id } = req.body;
    // type can be 'check-in' or 'check-out'
    try {
      const date = new Date(timestamp).toISOString().split('T')[0];
      const time = new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
      
      const attendanceRef = firestore.collection("attendance").doc(`${student_id}_${date}`);
      const doc = await attendanceRef.get();
      
      const updateData: any = {
        student_id,
        date,
        updated_at: new Date().toISOString(),
        device_id
      };

      if (type === 'check-in') {
        updateData.check_in = time;
        updateData.status = 'present';
      } else {
        updateData.check_out = time;
      }

      await attendanceRef.set(updateData, { merge: true });
      
      // Get student info for notification
      const studentDoc = await firestore.collection("students").doc(student_id).get();
      const student = studentDoc.data();
      
      res.json({ 
        success: true, 
        message: `${type} recorded for ${student?.name || student_id}`,
        studentName: student?.name
      });
    } catch (error) {
      console.error("Attendance error:", error);
      res.status(500).json({ error: "Failed to record attendance" });
    }
  });

  app.get("/api/attendance/class/:className", async (req, res) => {
    const { className } = req.params;
    const { date } = req.query;
    try {
      const db = getFirestoreInstance();
      if (!db) throw new Error("Firestore not initialized");

      let studentsQuery = db.collection("students").where("deleted_at", "==", null);
      if (className !== "All") {
        studentsQuery = studentsQuery.where("class", "==", className);
      }
      const studentsSnapshot = await studentsQuery.get();
      const students = studentsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .sort((a, b) => parseRoll(a.roll) - parseRoll(b.roll));
      
      const attendanceSnapshot = await db.collection("attendance").where("date", "==", date).get();
      const attendance = attendanceSnapshot.docs.map(doc => doc.data() as any);
      
      const result = {
        students,
        attendance
      };
      
      res.json(result);
    } catch (error) {
      console.error("Fetch attendance error:", error);
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance/bulk", async (req, res) => {
    const { date, records } = req.body;
    try {
      const db = getFirestoreInstance();
      
      // Fetch all existing attendance for this date in one query
      const existingSnapshot = await db.collection("attendance").where("date", "==", date).get();
      const existingMap = new Map();
      existingSnapshot.docs.forEach(doc => {
        existingMap.set(doc.data().student_id, doc.ref);
      });

      const batch = db.batch();
      let operationsCount = 0;
      const batches = [];
      let currentBatch = db.batch();

      for (const record of records) {
        const existingRef = existingMap.get(record.student_id);
        if (existingRef) {
          currentBatch.delete(existingRef);
          operationsCount++;
        }
        
        if (record.status) {
          const newRef = db.collection("attendance").doc();
          currentBatch.set(newRef, {
            student_id: record.student_id,
            date,
            status: record.status,
            created_at: new Date().toISOString()
          });
          operationsCount++;
        }

        if (operationsCount >= 400) {
          batches.push(currentBatch.commit());
          currentBatch = db.batch();
          operationsCount = 0;
        }
      }
      
      if (operationsCount > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);
      res.json({ success: true });
    } catch (error) {
      console.error("Bulk attendance error:", error);
      res.status(500).json({ error: "Failed to save attendance", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/admin/notify/attendance", async (req, res) => {
    try {
      const { date, className } = req.body;
      console.log(`Sending attendance notifications for class ${className} on ${date}`);
      res.json({ success: true, message: "Notifications sent successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to send notifications" });
    }
  });

  app.get("/api/attendance/student/:studentId/month/:month", async (req, res) => {
    const { studentId, month } = req.params;
    try {
      const snapshot = await firestore.collection("attendance").where("student_id", "==", studentId).get();
      const records = snapshot.docs.map(doc => doc.data() as any).filter(r => r.date.startsWith(month));
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance records" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    const { student_id, date, status } = req.body;
    try {
      await firestore.collection("attendance").add({
        student_id,
        date,
        status,
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save attendance" });
    }
  });

  app.get("/api/attendance/:studentId", async (req, res) => {
    try {
      const snapshot = await firestore.collection("attendance").where("student_id", "==", req.params.studentId).get();
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });

  // --- ZKTeco ADMS (Cloud) Direct Integration ---
  app.get("/iclock/cdata", (req, res) => {
    console.log(`ADMS GET /iclock/cdata - Query:`, req.query);
    // Standard ZKTeco response for initial connection
    res.send("OK");
  });

  app.get("/iclock/getrequest", (req, res) => {
    console.log(`ADMS GET /iclock/getrequest - Query:`, req.query);
    res.send("OK");
  });

  app.post("/iclock/cdata", express.text({ type: '*/*' }), async (req, res) => {
    const sn = req.query.SN || "unknown";
    const table = req.query.table || "unknown";
    console.log(`ADMS POST /iclock/cdata [SN:${sn}, Table:${table}] - Body received.`);
    
    try {
      const rawData = req.body;
      if (!rawData || typeof rawData !== 'string') {
        console.log("ADMS: Empty or invalid body received.");
        return res.send("OK");
      }

      console.log("ADMS Raw Data Snippet:", rawData.substring(0, 100));

      const lines = rawData.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const parts = line.split('\t');
        if (parts.length >= 2) {
          const userId = parts[0].trim();
          const timestamp = parts[1].trim(); // Format: "YYYY-MM-DD HH:MM:SS"
          
          const dateObj = new Date(timestamp);
          if (isNaN(dateObj.getTime())) {
            console.log(`ADMS: Invalid timestamp found: ${timestamp}`);
            continue;
          }

          const date = dateObj.toISOString().split('T')[0];
          const time = dateObj.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

          const db = getFirestoreInstance();
          if (!db) continue;

          // For ADMS, we need to map the biometric ID back to a user
          // First search for the student with this biometric_id
          const studentSnapshot = await db.collection("students").where("biometric_id", "==", userId).get();
          const teacherSnapshot = await db.collection("teachers").where("biometric_id", "==", userId).get();

          let targetId = userId;
          let targetType: 'student' | 'teacher' = 'student';
          let found = false;

          if (!studentSnapshot.empty) {
            targetId = studentSnapshot.docs[0].id;
            targetType = 'student';
            found = true;
          } else if (!teacherSnapshot.empty) {
            targetId = teacherSnapshot.docs[0].id;
            targetType = 'teacher';
            found = true;
          }

          if (!found) {
            console.log(`ADMS: Biometric ID ${userId} not mapped to any student or teacher.`);
            // We'll still save it under userId if not found, or maybe just skip it for now
            // For now, let's just skip it to keep the database clean
            continue;
          }

          const collectionName = targetType === 'teacher' ? 'teacher_attendance' : 'attendance';
          const idField = targetType === 'teacher' ? 'teacher_id' : 'student_id';
          const docId = `${targetId}_${date}`;
          const docRef = db.collection(collectionName).doc(docId);
          const doc = await docRef.get();

          if (!doc.exists) {
            await docRef.set({
              [idField]: targetId,
              date,
              status: 'present',
              check_in: time,
              check_out: null,
              method: 'device',
              updated_at: new Date().toISOString()
            });
            console.log(`ADMS: Recorded Check-in for ${targetType} ${targetId}`);
          } else {
            await docRef.update({
              check_out: time,
              updated_at: new Date().toISOString()
            });
            console.log(`ADMS: Recorded Check-out for ${targetType} ${targetId}`);
          }
        }
      }
      res.send("OK");
    } catch (error) {
      console.error("ADMS Processing Error:", error);
      res.send("OK"); 
    }
  });

  // --- Device Attendance (ZKTeco K40 Integration) ---
  app.post("/api/device/attendance", async (req, res) => {
    const { id, type } = req.body; // id: student_id or teacher_id, type: 'student' | 'teacher' | 'guardian'
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    try {
      let collectionName = type === 'teacher' ? 'teacher_attendance' : 'attendance';
      let idField = type === 'teacher' ? 'teacher_id' : 'student_id';
      let docId = `${id}_${date}`;

      const docRef = firestore.collection(collectionName).doc(docId);
      const doc = await docRef.get();

      if (!doc.exists) {
        // Check-in
        await docRef.set({
          [idField]: id,
          date,
          status: 'present',
          check_in: time,
          check_out: null,
          method: 'device',
          updated_at: now.toISOString()
        });
        res.json({ success: true, action: 'check_in', time });
      } else {
        // Check-out
        await docRef.update({
          check_out: time,
          updated_at: now.toISOString()
        });
        res.json({ success: true, action: 'check_out', time });
      }

      // If it's a student, we can also log to a separate history collection for detailed tracking
      if (type === 'student' || type === 'guardian') {
        await firestore.collection("attendance_history").add({
          id,
          type,
          date,
          time,
          action: doc.exists ? 'check_out' : 'check_in',
          timestamp: now.toISOString()
        });
      }

    } catch (error) {
      console.error("Device attendance error:", error);
      res.status(500).json({ error: "Failed to record device attendance" });
    }
  });

  app.get("/api/admin/device-history", async (req, res) => {
    try {
      const historySnapshot = await firestore.collection("attendance_history")
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();
      
      const history = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json(history);
    } catch (error) {
      console.error("Fetch history error:", error);
      res.status(500).json({ error: "Failed to fetch device history" });
    }
  });

  // --- Attendance Push (For Biometric Machines) ---
  app.post("/api/attendance/push", async (req, res) => {
    const { biometric_id, timestamp, method } = req.body;
    const now = timestamp ? new Date(timestamp) : new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    try {
      // 1. Find Student or Teacher by biometric_id
      let person: any = null;
      let type: 'student' | 'teacher' = 'student';

      const studentSnapshot = await firestore.collection("students").where("biometric_id", "==", biometric_id).where("deleted_at", "==", null).get();
      if (!studentSnapshot.empty) {
        person = { id: studentSnapshot.docs[0].id, ...studentSnapshot.docs[0].data() };
        type = 'student';
      } else {
        const teacherSnapshot = await firestore.collection("teachers").where("biometric_id", "==", biometric_id).where("deleted_at", "==", null).get();
        if (!teacherSnapshot.empty) {
          person = { id: teacherSnapshot.docs[0].id, ...teacherSnapshot.docs[0].data() };
          type = 'teacher';
        }
      }

      if (!person) {
        return res.status(404).json({ error: "No student or teacher found with this biometric ID" });
      }

      let collectionName = type === 'teacher' ? 'teacher_attendance' : 'attendance';
      let idField = type === 'teacher' ? 'teacher_id' : 'student_id';
      let docId = `${person.id}_${date}`;

      const docRef = firestore.collection(collectionName).doc(docId);
      const doc = await docRef.get();

      if (!doc.exists) {
        // Check-in
        await docRef.set({
          [idField]: person.id,
          date,
          status: 'present',
          check_in: time,
          check_out: null,
          method: method || 'device',
          updated_at: now.toISOString()
        });
        res.json({ success: true, action: 'check_in', person: person.name, type });
      } else {
        // Check-out
        await docRef.update({
          check_out: time,
          updated_at: now.toISOString()
        });
        res.json({ success: true, action: 'check_out', person: person.name, type });
      }

      // Log to history
      await firestore.collection("attendance_history").add({
        person_id: person.id,
        name: person.name,
        type,
        date,
        time,
        action: doc.exists ? 'check_out' : 'check_in',
        method: method || 'device',
        timestamp: now.toISOString()
      });

    } catch (error) {
      console.error("Attendance push error:", error);
      res.status(500).json({ error: "Failed to record attendance" });
    }
  });

  // --- Biometric Registration ---
  app.post("/api/admin/biometric/register", async (req, res) => {
    const { id, type, biometric_id, biometricId } = req.body;
    const finalBiometricId = biometric_id || biometricId;
    try {
      const collectionName = type === 'teacher' ? 'teachers' : 'students';
      await firestore.collection(collectionName).doc(id).update({
        biometric_id: finalBiometricId,
        updated_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Biometric registration error:", error);
      res.status(500).json({ error: "Failed to register biometric ID" });
    }
  });

  app.get("/api/admin/biometric/history", async (req, res) => {
    try {
      const historySnapshot = await firestore.collection("attendance_history")
        .orderBy("timestamp", "desc")
        .limit(100)
        .get();
      
      const history = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json(history);
    } catch (error) {
      console.error("Fetch biometric history error:", error);
      res.status(500).json({ error: "Failed to fetch biometric history" });
    }
  });

  app.get("/api/parent/device-history/:studentId", async (req, res) => {
    const { studentId } = req.params;
    try {
      const historySnapshot = await firestore.collection("attendance_history")
        .where("id", "==", studentId)
        .get();
      
      const history = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 30);
      
      res.json(history);
    } catch (error) {
      console.error("Fetch parent history error:", error);
      res.status(500).json({ error: "Failed to fetch device history" });
    }
  });

  // --- Results ---
  app.get("/api/admin/results/class/:className", async (req, res) => {
    const { className } = req.params;
    const { exam_name, year } = req.query;
    console.log(`Fetching results for class: ${className}, exam: ${exam_name}, year: ${year}`);
    try {
      const db = getFirestoreInstance();
      if (!db) throw new Error("Firestore not initialized");

      const studentsSnapshot = await db.collection("students").where("class", "==", className).where("deleted_at", "==", null).get();
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      console.log(`Found ${students.length} students for class ${className}`);
      
      let resultsQuery = db.collection("results")
        .where("exam_name", "==", exam_name || "")
        .where("class_name", "==", className);
      
      if (year) {
        resultsQuery = resultsQuery.where("year", "==", year);
      }

      const resultsSnapshot = await resultsQuery.get();
      const results = resultsSnapshot.docs.map(doc => doc.data() as any);
      
      // Fetch current active subjects for this class
      const subjectsSnapshot = await db.collection("subjects").where("class", "==", className).get();
      const validSubjectNames = new Set(subjectsSnapshot.docs.map(doc => doc.data().name));
      
      const data = students.map((s: any) => {
        const rawStudentResults = results.filter((r: any) => r.student_id === s.id);
        const uniqueSubjectsMap = new Map();
        rawStudentResults.forEach((r: any) => {
          if (validSubjectNames.has(r.subject)) {
            uniqueSubjectsMap.set(r.subject, r);
          }
        });
        
        const studentResults = Array.from(uniqueSubjectsMap.values());
        const totalMarks = studentResults.reduce((sum: number, r: any) => sum + (Number(r.marks) || 0), 0);
        const avgMarks = validSubjectNames.size > 0 ? totalMarks / validSubjectNames.size : (studentResults.length > 0 ? totalMarks / studentResults.length : 0);
        return {
          ...s,
          subjects: studentResults,
          totalMarks,
          avgMarks
        };
      });

      data.sort((a, b) => parseRoll(a.roll) - parseRoll(b.roll));
      res.json(data);
    } catch (error) {
      console.error("Fetch class results error:", error);
      res.status(500).json({ error: "Failed to fetch results", details: String(error) });
    }
  });

  app.post("/api/results/bulk", async (req, res) => {
    const { results } = req.body;
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ error: "Results must be a non-empty array" });
    }
    try {
      const db = getFirestoreInstance();
      const examName = results[0].exam_name;
      const className = results[0].class_name;
      const resultYear = results[0].year || new Date().getFullYear().toString();

      // Fetch ALL results for this exam, class, and year across ALL subjects in this batch
      const existingSnapshot = await db.collection("results")
        .where("exam_name", "==", examName)
        .where("class_name", "==", className)
        .where("year", "==", resultYear)
        .get();
      
      const existingResultsMap = new Map();
      existingSnapshot.docs.forEach(doc => {
        const data = doc.data();
        existingResultsMap.set(`${data.student_id}_${data.subject}`, { id: doc.id, ...data });
      });

      const batches = [];
      let currentBatch = db.batch();
      let operationsCount = 0;

      for (const r of results) {
        const { student_id, subject, marks, grade, date } = r;
        const lookupKey = `${student_id}_${subject}`;
        const existing = existingResultsMap.get(lookupKey);
        
        if (existing) {
          currentBatch.update(db.collection("results").doc(existing.id), {
            marks: Number(marks),
            grade,
            date,
            updated_at: new Date().toISOString()
          });
        } else {
          const newDocRef = db.collection("results").doc();
          currentBatch.set(newDocRef, {
            ...r,
            marks: Number(marks),
            created_at: new Date().toISOString()
          });
        }
        
        operationsCount++;
        if (operationsCount >= 400) {
          batches.push(currentBatch.commit());
          currentBatch = db.batch();
          operationsCount = 0;
        }
      }
      
      if (operationsCount > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);
      res.json({ success: true, count: results.length });
    } catch (error) {
      console.error("Bulk save results failed", error);
      res.status(500).json({ error: "Failed to save results" });
    }
  });

  app.post("/api/results", async (req, res) => {
    const { student_id, exam_name, subject, marks, grade, date } = req.body;
    try {
      const db = getFirestoreInstance();
      if (!db) throw new Error("Firestore not initialized");
      await db.collection("results").add({
        student_id,
        exam_name,
        subject,
        marks: Number(marks),
        grade,
        date,
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save result" });
    }
  });

  app.get("/api/results/:studentId", async (req, res) => {
    try {
      const db = getFirestoreInstance();
      if (!db) throw new Error("Firestore not initialized");
      const snapshot = await db.collection("results").where("student_id", "==", req.params.studentId).get();
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // --- Hifz ---
  app.post("/api/hifz", async (req, res) => {
    const { student_id, date, sabak, sabki, manzil } = req.body;
    try {
      await firestore.collection("hifz_records").add({
        student_id,
        date,
        sabak,
        sabki,
        manzil,
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save hifz record" });
    }
  });

  app.get("/api/hifz/:studentId", async (req, res) => {
    try {
      const snapshot = await firestore.collection("hifz_records").where("student_id", "==", req.params.studentId).get();
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hifz records" });
    }
  });

  // --- Notices ---
  app.get("/api/notices", async (req, res) => {
    try {
      const snapshot = await firestore.collection("notices").where("is_active", "==", 1).get();
      let notices = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        // Fetch vote count
        const votesSnapshot = await firestore.collection("notices").doc(doc.id).collection("votes").get();
        const votes = votesSnapshot.docs.map(v => v.data());
        const yes_count = votes.filter((v: any) => v.vote === 'yes').length;
        const no_count = votes.filter((v: any) => v.vote === 'no').length;
        
        return { 
          id: doc.id, 
          ...data, 
          vote_count: votesSnapshot.size,
          total_votes: votesSnapshot.size,
          yes_count,
          no_count
        } as any;
      }));
      notices.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.json(notices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notices" });
    }
  });

  app.post("/api/notices", async (req, res) => {
    const { title, content, image_url, link_url, width, height, allow_poll } = req.body;
    try {
      await firestore.collection("notices").add({
        title,
        content,
        image_url: image_url || null,
        link_url: link_url || null,
        width: width || null,
        height: height || null,
        allow_poll: allow_poll !== undefined ? !!allow_poll : true,
        is_active: 1,
        date: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to create notice" });
    }
  });

  app.put("/api/admin/notices/:id", async (req, res) => {
    const { title, content, is_active, image_url, link_url, width, height, allow_poll } = req.body;
    try {
      await firestore.collection("notices").doc(req.params.id).update({
        title,
        content,
        image_url: image_url || null,
        link_url: link_url || null,
        width: width || null,
        height: height || null,
        allow_poll: allow_poll !== undefined ? !!allow_poll : false,
        is_active: is_active !== undefined ? Number(is_active) : 1,
        updated_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update notice" });
    }
  });

  app.get("/api/notices/:id/votes", async (req, res) => {
    try {
      const snapshot = await firestore.collection("notices").doc(req.params.id).collection("votes").get();
      const voters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const yes_count = voters.filter((v: any) => v.vote === 'yes').length;
      const no_count = voters.filter((v: any) => v.vote === 'no').length;
      
      res.json({
        total_votes: voters.length,
        yes_count,
        no_count,
        voters
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch votes" });
    }
  });

  app.post("/api/notices/:id/vote", async (req, res) => {
    const { student_id, student_name, vote } = req.body;
    try {
      if (!student_id) {
        return res.status(400).json({ error: "Student ID is required" });
      }
      const noticeDoc = await firestore.collection("notices").doc(req.params.id).get();
      if (!noticeDoc.exists || !noticeDoc.data()?.allow_poll) {
        return res.status(400).json({ error: "Polls are not allowed for this notice" });
      }

      // One vote per student
      await firestore.collection("notices").doc(req.params.id).collection("votes").doc(String(student_id)).set({
        student_id: String(student_id),
        student_name,
        vote,
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Vote error:", error);
      res.status(500).json({ error: "Failed to add vote" });
    }
  });

  app.delete("/api/admin/notices/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      await firestore.collection("notices").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete notice" });
    }
  });

  // --- Hifz Management ---
  app.get("/api/admin/settings/hifz", async (req, res) => {
    try {
      const doc = await firestore.collection("settings").doc("hifz").get();
      if (doc.exists) {
        res.json(doc.data());
      } else {
        res.json({ guardian_view_enabled: false, guardian_login_by_id_enabled: true });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hifz settings" });
    }
  });

  app.put("/api/admin/settings/hifz", async (req, res) => {
    try {
      const { guardian_view_enabled, guardian_login_by_id_enabled } = req.body;
      
      const updateData: any = {};
      if (guardian_view_enabled !== undefined) updateData.guardian_view_enabled = guardian_view_enabled;
      if (guardian_login_by_id_enabled !== undefined) updateData.guardian_login_by_id_enabled = guardian_login_by_id_enabled;
      
      await firestore.collection("settings").doc("hifz").set(updateData, { merge: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update hifz settings" });
    }
  });

  app.get("/api/admin/hifz-reports", async (req, res) => {
    try {
      const { student_id, start_date, end_date } = req.query;
      let query: any = firestore.collection("hifz_records");
      
      if (student_id) {
        // Fetch by student_id and filter dates in memory to avoid composite index requirement
        query = query.where("student_id", "==", student_id);
        const snapshot = await query.get();
        let reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        
        if (start_date) {
          reports = reports.filter(r => r.date >= start_date);
        }
        if (end_date) {
          reports = reports.filter(r => r.date <= end_date);
        }
        
        // Sort by date descending
        reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return res.json(reports);
      }
      
      // If no student_id, query by date range
      if (start_date) {
        query = query.where("date", ">=", start_date);
      }
      if (end_date) {
        query = query.where("date", "<=", end_date);
      }
      
      const snapshot = await query.get();
      const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(reports);
    } catch (error) {
      console.error("Hifz reports fetch error:", error);
      res.status(500).json({ error: "Failed to fetch hifz reports" });
    }
  });

  app.post("/api/admin/hifz-reports", async (req, res) => {
    try {
      const reportData = req.body;
      const docRef = await firestore.collection("hifz_records").add({
        ...reportData,
        created_at: new Date().toISOString()
      });
      res.json({ success: true, id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create hifz report" });
    }
  });

  app.delete("/api/admin/hifz-reports/:id", async (req, res) => {
    try {
      const { password } = req.body;
      if (!(await verifyAdminOrSubAdmin(password, "all"))) {
        return res.status(401).json({ error: "Incorrect password" });
      }
      await firestore.collection("hifz_records").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete hifz report" });
    }
  });

  
  // --- Leaderboard API ---
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const studentsSnapshot = await firestore.collection("students").where("deleted_at", "==", null).get();
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Simple scoring for now: Randomize slightly or use actual data if available
      // In a real app, you'd aggregate attendance and amal. Here we'll generate a score based on their data.
      const leaderboard = students.map(s => {
        // Mock score calculation based on ID length or other fields to make it deterministic but varied
        let score = 0;
        if (s.roll) score += parseInt(s.roll) || 0;
        score += (s.name?.length || 0) * 5;
        // Add random element for demo purposes if no real data
        score += Math.floor(Math.random() * 50);
        
        return {
          id: s.id,
          name: s.name,
          class: s.class,
          photo_url: s.photo_url,
          score: score
        };
      }).sort((a, b) => b.score - a.score).slice(0, 10);

      res.json(leaderboard);
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });


  // --- Backup API ---
  const generateAndSendBackup = async () => {
    try {
      console.log("Starting automated backup...");
      const settingsDoc = await firestore.collection("site_settings").doc("1").get();
      const settings = settingsDoc.data();
      
      if (!settings || !settings.smtp_user || !settings.smtp_pass) {
        console.log("SMTP not configured. Skipping backup.");
        return false;
      }

      // Fetch data
      const studentsSnap = await firestore.collection("students").get();
      const incomeSnap = await firestore.collection("income").get();
      const expenseSnap = await firestore.collection("expenses").get();

      const students = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const income = incomeSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const expenses = expenseSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Create Excel workbook
      const wb = xlsx.utils.book_new();
      
      const wsStudents = xlsx.utils.json_to_sheet(students);
      xlsx.utils.book_append_sheet(wb, wsStudents, "Students");
      
      const wsIncome = xlsx.utils.json_to_sheet(income);
      xlsx.utils.book_append_sheet(wb, wsIncome, "Income");
      
      const wsExpenses = xlsx.utils.json_to_sheet(expenses);
      xlsx.utils.book_append_sheet(wb, wsExpenses, "Expenses");

      // Write to buffer
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Send Email
      const transporter = nodemailer.createTransport({
        host: settings.smtp_host || "smtp.gmail.com",
        port: parseInt(settings.smtp_port) || 587,
        secure: parseInt(settings.smtp_port) === 465,
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_pass
        }
      });

      const mailOptions = {
        from: `"${settings.madrasa_name || 'Madrasa Admin'}" <${settings.sender_email || settings.smtp_user}>`,
        to: settings.smtp_user, // Send to admin's own email
        subject: `Automated Database Backup - ${new Date().toLocaleDateString()}`,
        text: "Please find attached the automated database backup.",
        attachments: [
          {
            filename: `Backup_${new Date().toISOString().split('T')[0]}.xlsx`,
            content: buffer
          }
        ]
      };

      await transporter.sendMail(mailOptions);
      console.log("Backup sent successfully to", settings.smtp_user);
      return true;
    } catch (error) {
      console.error("Backup error:", error);
      return false;
    }
  };

  app.post("/api/admin/trigger-backup", async (req, res, next) => {
    try {
      const { password } = req.body;
      if (!(await verifyAdminOrSubAdmin(password, "all"))) {
        return res.status(401).json({ error: "Invalid password" });
      }
      
      // Run backup in background
      generateAndSendBackup().then(success => {
        if (success) {
          console.log("Manual backup completed successfully");
        } else {
          console.error("Manual backup failed");
        }
      }).catch(err => {
        console.error("Manual backup error:", err);
      });

      res.json({ success: true, message: "ব্যাকআপ প্রক্রিয়া শুরু হয়েছে। কিছুক্ষণের মধ্যে আপনার ইমেইলে ব্যাকআপ ফাইলটি পৌঁছে যাবে।" });
    } catch (error) {
      next(error);
    }
  });

  // Schedule backup every Friday at 11:59 PM
  cron.schedule('59 23 * * 5', () => {
    generateAndSendBackup();
  });

  // --- Admin Stats ---
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const studentsSnapshot = await firestore.collection("students").where("deleted_at", "==", null).get();
      const feesSnapshot = await firestore.collection("fees").where("status", "==", "paid").get();
      const expensesSnapshot = await firestore.collection("expenses").get();
      
      const income = feesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      const expenses = expensesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

      res.json({
        students: studentsSnapshot.size,
        income: income,
        expenses: expenses
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // --- Subjects ---
  app.get("/api/subjects/:className", async (req, res) => {
    console.log(`Fetching subjects for class: ${req.params.className}`);
    try {
      const snapshot = await firestore.collection("subjects").where("class", "==", req.params.className).get();
      const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      res.json(subjects);
    } catch (error) {
      console.error("Fetch subjects error:", error);
      res.status(500).json({ error: "Failed to fetch subjects", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    const { class_name: className, name, full_marks } = req.body;
    try {
      const db = getFirestoreInstance();
      if (!db) throw new Error("Firestore not initialized");
      await db.collection("subjects").add({
        class: className || "Unknown",
        name,
        full_marks: full_marks || 100,
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Add subject error:", error);
      res.status(500).json({ error: "Failed to add subject" });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) { return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" }); }
    try {
      await firestore.collection("subjects").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subject" });
    }
  });

  // --- Parent Login ---
  app.post("/api/teacher-login", async (req, res) => {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: "মোবাইল নম্বর বা ইমেইল আবশ্যক" });

    try {
      const snapshot = await firestore.collection("teachers").where("phone", "==", identifier).get();
      if (!snapshot.empty) {
        const teacher = snapshot.docs[0].data();
        if (teacher.deleted_at) return res.status(401).json({ error: "আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে" });
        return res.json({ id: snapshot.docs[0].id, ...teacher });
      }

      const emailSnapshot = await firestore.collection("teachers").where("email", "==", identifier).get();
      if (!emailSnapshot.empty) {
        const teacher = emailSnapshot.docs[0].data();
        if (teacher.deleted_at) return res.status(401).json({ error: "আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে" });
        return res.json({ id: emailSnapshot.docs[0].id, ...teacher });
      }

      const codeSnapshot = await firestore.collection("teachers").where("id_code", "==", identifier).get();
      if (!codeSnapshot.empty) {
        const teacher = codeSnapshot.docs[0].data();
        if (teacher.deleted_at) return res.status(401).json({ error: "আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে" });
        return res.json({ id: codeSnapshot.docs[0].id, ...teacher });
      }

      res.status(401).json({ error: "শিক্ষক খুঁজে পাওয়া যায়নি" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "লগইন করতে সমস্যা হয়েছে" });
    }
  });

  app.post("/api/parent-login", async (req, res) => {
    const identifier = req.body.identifier?.trim();
    
    if (!identifier) {
      return res.status(400).json({ error: "মোবাইল নম্বর, ইমেইল বা স্টুডেন্ট কোড দিন।" });
    }

    try {
      // Fetch Hifz settings to check if login by ID is enabled
      const hifzSettingsDoc = await firestore.collection("settings").doc("hifz").get();
      const hifzSettings = hifzSettingsDoc.exists ? hifzSettingsDoc.data() : { guardian_login_by_id_enabled: true };
      const loginByIdEnabled = hifzSettings.guardian_login_by_id_enabled !== false;

      // Check phone
      let snapshot = await firestore.collection("students").where("phone", "==", identifier).where("deleted_at", "==", null).get();
      if (snapshot.empty) {
        // Check email
        snapshot = await firestore.collection("students").where("email", "==", identifier).where("deleted_at", "==", null).get();
      }
      
      if (snapshot.empty && loginByIdEnabled) {
        // Check student_code ONLY if login by ID is enabled
        snapshot = await firestore.collection("students").where("student_code", "==", identifier).where("deleted_at", "==", null).get();
      }

      if (snapshot.empty) {
        const errorMsg = loginByIdEnabled 
          ? "মোবাইল নম্বর, ইমেইল বা স্টুডেন্ট কোড সঠিক নয়।" 
          : "মোবাইল নম্বর বা ইমেইল সঠিক নয়।";
        return res.status(401).json({ error: errorMsg });
      }

      const student = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      res.json(student);
    } catch (error) {
      console.error("Parent login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/parent/payment-history/:id", async (req, res) => {
    try {
      const snapshot = await firestore!.collection("pending_payments")
        .where("studentId", "==", req.params.id)
        .get();
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      history.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });

  app.post("/api/parent/pay-fee", async (req, res) => {
    const { 
      studentId, months, year, amount, method, 
      transactionId: manualTrxID, senderPhone, reference
    } = req.body;
    try {
      const settingsDoc = await firestore!.collection("site_settings").doc("1").get();
      const settings = settingsDoc.data() || {};
      
      const studentDoc = await firestore!.collection("students").doc(studentId).get();
      if (!studentDoc.exists) return res.status(404).json({ error: "Student not found" });
      const student = studentDoc.data();

      // Create a pending transaction
      const transactionId = await getNextSerial("AHM");
      
      const pendingPayment = {
        transactionId,
        studentId,
        studentName: student?.name,
        studentWhatsapp: student?.whatsapp,
        months,
        year,
        amount,
        method,
        status: "pending",
        manualTrxID: manualTrxID || null,
        senderPhone: senderPhone || null,
        reference: reference || null,
        createdAt: new Date().toISOString()
      };
      
      await firestore!.collection("pending_payments").doc(transactionId).set(pendingPayment);

      if (method === "udyoktapay") {
        const udyoktaKey = settings.udyoktapay_api_key || "M0HfKk78miHmrHbLCGUCPPs4JzUUDUkBYAtFWbif";
        const udyoktaUrl = settings.udyoktapay_api_url || "https://alhera.paymently.io/api/checkout-v2";

        if (!udyoktaKey || !udyoktaUrl) {
          return res.status(400).json({ error: "Udyokta Pay is not configured." });
        }

        const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
        const payload = {
          full_name: student?.name || "Student",
          email: student?.email || "student@gmail.com",
          mobile_number: student?.guardian_phone || student?.phone || "01700000000",
          amount: amount,
          metadata: {
            transactionId
          },
          redirect_url: `${baseUrl}/parent?payment=success`,
          cancel_url: `${baseUrl}/parent?payment=cancel`,
          webhook_url: `${baseUrl}/api/udyoktapay/webhook`
        };

        console.log("Initiating Udyokta Pay with URL:", udyoktaUrl);
        const response = await fetch(udyoktaUrl, {
          method: "POST",
          headers: {
            "RT-UDYOKTAPAY-API-KEY": udyoktaKey,
            "X-API-KEY": udyoktaKey,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Udyokta Pay Initiation Response:", data);
        
        if ((data.status === true || data.status === "success" || data.payment_url) && data.payment_url) {
          return res.json({ payment_url: data.payment_url });
        } else {
          console.error("Udyokta Pay initiation failed:", data);
          return res.status(500).json({ error: data.message || "Failed to initiate payment with Udyokta Pay." });
        }
      } else if (method.startsWith("manual_")) {
        // Manual payment (bKash/Nagad/Rocket personal number)
        return res.json({ 
          success: true, 
          transactionId, 
          message: "আপনার পেমেন্ট রিকোয়েস্ট গ্রহণ করা হয়েছে। এডমিন ভেরিফাই করলে আপনার ফি পেইড হয়ে যাবে।" 
        });
      } else {
        return res.status(400).json({ error: "Invalid payment method" });
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Payment initiation failed" });
    }
  });

  app.post("/api/udyoktapay/webhook", async (req, res) => {
    const { status, metadata, amount, invoice_id } = req.body;
    console.log("Udyokta Pay Webhook Received:", req.body);
    
    try {
      const apiKeyHeader = req.headers['rt-udyoktapay-api-key'] || req.headers['x-api-key'];
      const settingsDoc = await firestore!.collection("site_settings").doc("1").get();
      const settings = settingsDoc.data() || {};
      
      if (apiKeyHeader !== settings.udyoktapay_api_key) {
        console.warn("Udyokta Pay Webhook Unauthorized:", apiKeyHeader);
        return res.status(401).send("Unauthorized");
      }

      if ((status === "COMPLETED" || status === "success") && metadata?.transactionId) {
        const txDoc = await firestore!.collection("pending_payments").doc(metadata.transactionId).get();
        if (txDoc.exists) {
          const txData = txDoc.data();
          if (txData?.status === "pending") {
            // Mark as paid
            await firestore!.collection("pending_payments").doc(metadata.transactionId).update({ status: "completed" });
            
            // Create fee records
            const receiptNumber = await getNextSerial("AHM");
            for (const month of txData.months) {
              const feeData = {
                student_id: txData.studentId,
                student_name: txData.studentName,
                amount: txData.amount / txData.months.length,
                month: month,
                year: txData.year,
                status: "paid",
                paid_date: new Date().toISOString(),
                receipt_number: receiptNumber,
                payment_method: "Udyokta Pay"
              };
              await firestore!.collection("fees").add(feeData);
            }
            
            // Add to transactions
            await firestore!.collection("transactions").add({
              type: "income",
              category: "Monthly Fee",
              amount: txData.amount,
              date: new Date().toISOString(),
              description: `Monthly Fee for ${txData.months.join(", ")} ${txData.year} - ${txData.studentName}`,
              receipt_number: receiptNumber,
              payment_method: "Udyokta Pay"
            });
          }
        }
      }
      res.send("OK");
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).send("Error");
    }
  });

  app.post("/api/udyoktapay/verify", async (req, res) => {
    const { invoice_id } = req.body;
    
    try {
      const settingsDoc = await firestore!.collection("site_settings").doc("1").get();
      const settings = settingsDoc.data() || {};
      const udyoktaKey = settings.udyoktapay_api_key || process.env.UDYOKTAPAY_API_KEY || "M0HfKk78miHmrHbLCGUCPPs4JzUUDUkBYAtFWbif";
      const udyoktaUrl = settings.udyoktapay_api_url || process.env.UDYOKTAPAY_API_URL || "https://alhera.paymently.io/api/checkout-v2";
      
      // Construct verify URL from checkout URL
      const verifyUrl = udyoktaUrl.replace("checkout-v2", "verify-payment").replace("checkout", "verify-payment");
      
      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "RT-UDYOKTAPAY-API-KEY": udyoktaKey,
          "X-API-KEY": udyoktaKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ invoice_id })
      });

      const data = await response.json();
      console.log("Udyokta Pay Verification Response:", data);

      if ((data.status === "COMPLETED" || data.status === "success") && data.metadata?.transactionId) {
        const txDoc = await firestore!.collection("pending_payments").doc(data.metadata.transactionId).get();
        if (txDoc.exists) {
          const txData = txDoc.data();
          if (txData?.status === "pending") {
            // Mark as paid
            await firestore!.collection("pending_payments").doc(data.metadata.transactionId).update({ status: "completed" });
            
            // Create fee records
            const receiptNumber = await getNextSerial("AHM");
            for (const month of txData.months) {
              const feeData = {
                student_id: txData.studentId,
                student_name: txData.studentName,
                amount: txData.amount / txData.months.length,
                month: month,
                year: txData.year,
                status: "paid",
                paid_date: new Date().toISOString(),
                receipt_number: receiptNumber,
                payment_method: "Udyokta Pay"
              };
              await firestore!.collection("fees").add(feeData);
            }
            
            // Add to transactions
            await firestore!.collection("transactions").add({
              type: "income",
              category: "Monthly Fee",
              amount: txData.amount,
              date: new Date().toISOString(),
              description: `Monthly Fee for ${txData.months.join(", ")} ${txData.year} - ${txData.studentName}`,
              receipt_number: receiptNumber,
              payment_method: "Udyokta Pay"
            });
            
            return res.json({ success: true, message: "পেমেন্ট সফলভাবে যাচাই করা হয়েছে!" });
          } else if (txData?.status === "completed") {
            return res.json({ success: true, message: "পেমেন্ট ইতিমধ্যে সম্পন্ন হয়েছে।" });
          }
        }
      }
      
      res.json({ success: false, message: "পেমেন্ট যাচাই করা যায়নি বা পেন্ডিং আছে।" });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Error verifying payment" });
    }
  });

  app.get("/api/admin/online-payments", async (req, res) => {
    try {
      const snapshot = await firestore!.collection("pending_payments").get();
      const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      payments.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch online payments" });
    }
  });

  app.post("/api/admin/pending-payments/:id/approve", async (req, res) => {
    const { id } = req.params;
    try {
      const txDoc = await firestore!.collection("pending_payments").doc(id).get();
      if (!txDoc.exists) return res.status(404).json({ error: "Transaction not found" });
      
      const txData = txDoc.data();
      await firestore!.collection("pending_payments").doc(id).update({ status: "completed" });
      
      const receiptNumber = await getNextSerial("AHM");
      for (const month of txData?.months) {
        await firestore!.collection("fees").add({
          student_id: txData?.studentId,
          student_name: txData?.studentName,
          amount: txData?.amount / txData?.months.length,
          month: month,
          year: txData?.year,
          status: "paid",
          paid_date: new Date().toISOString(),
          receipt_number: receiptNumber,
          payment_method: txData?.method
        });
      }
      
      await firestore!.collection("transactions").add({
        type: "income",
        category: "Monthly Fee",
        amount: txData?.amount,
        date: new Date().toISOString(),
        description: `Monthly Fee for ${txData?.months.join(", ")} ${txData?.year} - ${txData?.studentName}`,
        receipt_number: receiptNumber,
        payment_method: txData?.method
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve payment" });
    }
  });

  app.post("/api/admin/pending-payments/:id/reject", async (req, res) => {
    const { id } = req.params;
    try {
      await firestore!.collection("pending_payments").doc(id).update({ status: "rejected" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject payment" });
    }
  });

  // --- Bulk Fee Payment ---
  app.post("/api/admin/fees/bulk-pay", async (req, res) => {
    const { feeIds, transactionId, paidDate } = req.body;
    try {
      const batch = firestore.batch();
      for (const id of feeIds) {
        batch.update(firestore.collection("fees").doc(id), {
          status: 'paid',
          paid_date: paidDate || new Date().toISOString(),
          transaction_id: transactionId || 'CASH'
        });
      }
      await batch.commit();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to process bulk payment" });
    }
  });

  // --- bKash Payment API Placeholder ---
  app.post("/api/bkash/create-payment", (req, res) => {
    const { amount, reference } = req.body;
    // In a real app, you would call bKash API here.
    // This is a mock response for the payment gateway integration.
    res.json({
      success: true,
      paymentID: "BKASH_" + Date.now(),
      bkashURL: "https://sandbox.payment.bkash.com/redirect/token=" + Date.now(),
      message: "bKash payment created successfully"
    });
  });

  // --- Nodemailer Email API ---
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, text, attachments, email, pdfData, filename } = req.body;
    
    const targetEmail = email || to;
    const targetPdfData = pdfData || (attachments && attachments[0]?.content);
    const targetFilename = filename || (attachments && attachments[0]?.filename);
    const targetSubject = subject || "Payment Receipt - Al Hera Madrasa";
    const targetText = text || "Please find your payment receipt attached.";

    if (!targetEmail || !targetPdfData) {
      return res.status(400).json({ error: "Missing email or pdfData" });
    }

    try {
      const db = getFirestoreInstance();
      const settingsSnapshot = await db.collection("site_settings").limit(1).get();
      const siteSettings = settingsSnapshot.docs[0]?.data() || {};

      const transporter = nodemailer.createTransport({
        host: siteSettings.smtp_host || process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(siteSettings.smtp_port || process.env.SMTP_PORT || "587"),
        secure: (siteSettings.smtp_port === 465) || (process.env.SMTP_SECURE === "true"),
        auth: {
          user: siteSettings.smtp_user || process.env.SMTP_USER,
          pass: siteSettings.smtp_pass || process.env.SMTP_PASS,
        },
      });

      const base64Data = targetPdfData.split(",")[1] || targetPdfData;

      await transporter.sendMail({
        from: `"Al Hera Madrasa" <${siteSettings.sender_email || siteSettings.smtp_user || process.env.SMTP_USER}>`,
        to: targetEmail,
        subject: targetSubject,
        text: targetText,
        attachments: [
          {
            filename: targetFilename || "receipt.pdf",
            content: base64Data,
            encoding: "base64",
          },
        ],
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  // --- Database Reset ---
  app.get("/api/admin/archive/students", async (req, res) => {
    try {
      const snapshot = await firestore!.collection("archive_students").get();
      const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(students);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch archive students" });
    }
  });

  app.get("/api/admin/archive/students/:id/full-profile", async (req, res) => {
    try {
      const studentDoc = await firestore!.collection("archive_students").doc(req.params.id).get();
      if (!studentDoc.exists) return res.status(404).json({ error: "Student not found" });

      const feesSnapshot = await firestore!.collection("archive_fees").where("student_id", "==", req.params.id).get();
      const fees = feesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const transactionsSnapshot = await firestore!.collection("archive_transactions").where("student_id", "==", req.params.id).get();
      const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.json({
        student: { id: studentDoc.id, ...studentDoc.data() },
        fees,
        transactions,
        results: []
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/admin/database/reset", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" });

    try {
      const collectionsToClear = [
        "students", "exams", "fees", "attendance", "results", "hifz_records",
        "subjects", "notices", "donations", "expenses", "income", "teacher_attendance",
        "admissions", "teacher_salaries", "fee_setups", "job_applications", "delete_history"
      ];

      for (const collectionName of collectionsToClear) {
        const snapshot = await firestore.collection(collectionName).get();
        if (snapshot.empty) continue;
        
        const chunks = [];
        for (let i = 0; i < snapshot.docs.length; i += 250) {
          chunks.push(snapshot.docs.slice(i, i + 250));
        }

        for (const chunk of chunks) {
          const batch = firestore.batch();
          chunk.forEach(doc => {
            // Copy to trash
            const trashRef = firestore.collection(`trash_${collectionName}`).doc(doc.id);
            batch.set(trashRef, doc.data());
            // Delete from original
            batch.delete(doc.ref);
          });
          await batch.commit();
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "রিসেট করতে সমস্যা হয়েছে।" });
    }
  });

  app.post("/api/admin/database/recover", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" });

    try {
      const collectionsToRecover = [
        "students", "exams", "fees", "attendance", "results", "hifz_records",
        "subjects", "notices", "donations", "expenses", "income", "teacher_attendance",
        "admissions", "teacher_salaries", "fee_setups", "job_applications", "delete_history"
      ];

      for (const collectionName of collectionsToRecover) {
        const snapshot = await firestore.collection(`trash_${collectionName}`).get();
        if (snapshot.empty) continue;
        
        const chunks = [];
        for (let i = 0; i < snapshot.docs.length; i += 250) {
          chunks.push(snapshot.docs.slice(i, i + 250));
        }

        for (const chunk of chunks) {
          const batch = firestore.batch();
          chunk.forEach(doc => {
            // Copy back to original
            const originalRef = firestore.collection(collectionName).doc(doc.id);
            batch.set(originalRef, doc.data());
            // Delete from trash
            batch.delete(doc.ref);
          });
          await batch.commit();
        }
      }

      res.json({ success: true, message: "ডেটাবেস সফলভাবে রিকভার করা হয়েছে।" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "রিকভার করতে সমস্যা হয়েছে।" });
    }
  });

  app.post("/api/admin/database/permanent-delete", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) return res.status(401).json({ error: "ভুল পাসওয়ার্ড বা অনুমতি নেই!" });

    try {
      // Archive students, fees, and transactions before permanent deletion
      const archiveCollections = ["students", "fees", "transactions"];
      for (const collectionName of archiveCollections) {
        const snapshot = await firestore!.collection(`trash_${collectionName}`).get();
        if (!snapshot.empty) {
          const chunks = [];
          for (let i = 0; i < snapshot.docs.length; i += 250) {
            chunks.push(snapshot.docs.slice(i, i + 250));
          }
          for (const chunk of chunks) {
            const batch = firestore!.batch();
            chunk.forEach(doc => {
              const archiveRef = firestore!.collection(`archive_${collectionName}`).doc(doc.id);
              batch.set(archiveRef, doc.data());
            });
            await batch.commit();
          }
        }
      }

      const collectionsToDelete = [
        "students", "exams", "fees", "attendance", "results", "hifz_records",
        "subjects", "notices", "donations", "expenses", "income", "teacher_attendance",
        "admissions", "teacher_salaries", "fee_setups", "job_applications", "delete_history", "transactions"
      ];

      for (const collectionName of collectionsToDelete) {
        const snapshot = await firestore!.collection(`trash_${collectionName}`).get();
        if (snapshot.empty) continue;
        
        const chunks = [];
        for (let i = 0; i < snapshot.docs.length; i += 500) {
          chunks.push(snapshot.docs.slice(i, i + 500));
        }

        for (const chunk of chunks) {
          const batch = firestore!.batch();
          chunk.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
      }

      res.json({ success: true, message: "ট্র্যাশ চিরতরে মুছে ফেলা হয়েছে।" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "ট্র্যাশ মুছতে সমস্যা হয়েছে।" });
    }
  });

// --- Server Startup ---
const PORT = 3000;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

// 404 handler for API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

async function start() {
  const distPath = path.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production";
  const hasDist = fs.existsSync(distPath);

  console.log(`Starting server: isProduction=${isProduction}, hasDist=${hasDist}`);

  if (!isProduction || !hasDist) {
    console.log("Using Vite middleware for development/fallback...");
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files from dist...");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
  }
}

// Global error handler for API routes - MUST BE AT THE END
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  if (req.path.startsWith('/api/')) {
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: err.message,
      path: req.path,
      method: req.method
    });
  } else {
    next(err);
  }
});

start();

export default app;
