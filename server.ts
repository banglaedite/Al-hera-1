import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the Firebase configuration
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));

// Initialize Firebase Admin
let serviceAccount: any = null;
try {
  serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'service-account.json'), 'utf8'));
} catch (e) {
  // Ignore if not found
}

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount?.project_id || firebaseConfig.projectId;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || serviceAccount?.client_email;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY || serviceAccount?.private_key;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      storageBucket: `${projectId}.appspot.com`
    });
  } else {
    // Fallback for local development or if env vars are missing
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
    console.warn("Firebase Admin initialized with limited credentials.");
  }
}
const firestoreOptions: any = {
  projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount?.project_id || firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId,
};

if (process.env.FIREBASE_CLIENT_EMAIL || serviceAccount?.client_email) {
  firestoreOptions.credentials = {
    client_email: process.env.FIREBASE_CLIENT_EMAIL || serviceAccount?.client_email,
    private_key: (process.env.FIREBASE_PRIVATE_KEY || serviceAccount?.private_key).replace(/\\n/g, '\n'),
  };
}

const firestore = new admin.firestore.Firestore(firestoreOptions);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Hardcoded SMTP Settings
  process.env.SMTP_HOST = "smtp.gmail.com";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "newdrshahidul@gmail.com";
  process.env.SMTP_PASS = "mogt vhhm jtme rjzg";
  process.env.SENDER_EMAIL = "newdrshahidul@gmail.com";

  // --- Database Seeding ---
  async function seedDatabase() {
    try {
      const settingsDoc = await firestore.collection("site_settings").doc("1").get();
      if (!settingsDoc.exists) {
        await firestore.collection("site_settings").doc("1").set({
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
          show_showcase_as_buttons: 1
        });
        console.log("Default site settings seeded.");
      }

      const featuresSnapshot = await firestore.collection("features").get();
      if (featuresSnapshot.empty) {
        const defaultFeatures = [
          { title: "অনলাইন ভর্তি", description: "সহজ ও দ্রুত অনলাইন ভর্তি প্রক্রিয়া", icon: "GraduationCap", is_active: 1 },
          { title: "ডিজিটাল হাজিরা", description: "ছাত্র ও শিক্ষকদের স্মার্ট হাজিরা সিস্টেম", icon: "CheckCircle2", is_active: 1 },
          { title: "ফলাফল ব্যবস্থাপনা", description: "পরীক্ষার ফলাফল ও প্রোগ্রেস রিপোর্ট", icon: "Award", is_active: 1 },
          { title: "ফি ম্যানেজমেন্ট", description: "অনলাইন ফি প্রদান ও রশিদ সংগ্রহ", icon: "CreditCard", is_active: 1 }
        ];
        for (const feature of defaultFeatures) {
          await firestore.collection("features").add(feature);
        }
        console.log("Default features seeded.");
      }
    } catch (error) {
      console.error("Seeding error:", error);
    }
  }

  seedDatabase();

  // --- Exams ---
  app.get("/api/exams", async (req, res) => {
    try {
      const examsSnapshot = await firestore!.collection("exams").orderBy("date", "desc").get();
      const exams = examsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(exams);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch exams" });
    }
  });

  app.post("/api/exams", async (req, res) => {
    const { name } = req.body;
    try {
      await firestore!.collection("exams").add({ name, date: new Date().toISOString() });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add exam" });
    }
  });

  // --- Transactions ---
  app.get("/api/admin/all-history", async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      let feesQuery: any = firestore!.collection("fees").where("status", "==", "paid");
      let incomeQuery: any = firestore!.collection("income");
      let expensesQuery: any = firestore!.collection("expenses");

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

      allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json(allData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch all history" });
    }
  });

  app.post("/api/admin/transactions", async (req, res) => {
    try {
      const data = req.body;
      const docRef = await firestore!.collection("transactions").add(data);
      res.json({ success: true, id: docRef.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.get("/api/admin/transactions", async (req, res) => {
    try {
      const transactionsSnapshot = await firestore!.collection("transactions").orderBy("paid_date", "desc").get();
      const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.delete("/api/admin/all-history/:type/:id", async (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.VITE_ADMIN_PASSWORD || "1234";
    if (password !== adminPassword && password !== "১২৩৪") {
      return res.status(401).json({ error: "ভুল পাসওয়ার্ড!" });
    }
    const { type, id } = req.params;
    try {
      let collectionName = "";
      if (type === "fee") collectionName = "fees";
      else if (type === "income") collectionName = "income";
      else if (type === "expense") collectionName = "expenses";
      else return res.status(400).json({ error: "Invalid type" });

      const docRef = firestore!.collection(collectionName).doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        await firestore!.collection("delete_history").add({
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
    if (password !== (process.env.VITE_ADMIN_PASSWORD || "1234") && password !== "১২৩৪") {
      return res.status(401).json({ error: "ভুল পাসওয়ার্ড!" });
    }
    try {
      const transactionRef = firestore!.collection("transactions").doc(req.params.id);
      const transactionDoc = await transactionRef.get();
      
      if (transactionDoc.exists) {
        await firestore!.collection("delete_history").add({
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
    const { limit = 50, offset = 0 } = req.query;
    try {
      const snapshot = await firestore.collection("delete_history").orderBy("deleted_at", "desc").get();
      const allHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const total = allHistory.length;
      const history = allHistory.slice(Number(offset), Number(offset) + Number(limit));
      
      res.json({
        data: history,
        total,
        hasMore: Number(offset) + Number(limit) < total
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch delete history" });
    }
  });

  // --- Parent Payment ---
  app.post("/api/parent/pay", async (req, res) => {
    const { feeId, transactionId, method, phone } = req.body;
    try {
      await firestore.collection("fees").doc(feeId).update({
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
      const donationsSnapshot = await firestore!.collection("donations").orderBy("date", "desc").get();
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
      await firestore!.collection("donations").add({ donor_name, amount, category, transaction_id, date: new Date().toISOString() });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add donation" });
    }
  });

  app.get("/api/features", async (req, res) => {
    try {
      const featuresSnapshot = await firestore!.collection("features").where("is_active", "==", 1).get();
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
      await firestore!.collection("features").add({ 
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
    try {
      await firestore!.collection("features").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete feature" });
    }
  });

  app.put("/api/admin/features/:id", async (req, res) => {
    const { title, description, image_url, icon, is_active } = req.body;
    try {
      await firestore.collection("features").doc(req.params.id).update({
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
      const studentsSnapshot = await firestore!.collection("students").where("class", "==", className).get();
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const report = await Promise.all(students.map(async (student: any) => {
        const feesSnapshot = await firestore!.collection("transactions")
          .where("student_id", "==", student.id)
          .where("paid_date", ">=", `${month}-01`)
          .where("paid_date", "<=", `${month}-31`)
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
      const studentsSnapshot = await firestore.collection("students").where("class", "==", className).where("deleted_at", "==", null).get();
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const report = await Promise.all(students.map(async (student: any) => {
        const feesSnapshot = await firestore.collection("fees")
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
      const itemsSnapshot = await firestore!.collection("showcase_items").get();
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
      await firestore!.collection("showcase_items").add({ title, description, url, type, created_at: new Date().toISOString() });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add showcase item" });
    }
  });

  app.delete("/api/admin/showcase-items/:id", async (req, res) => {
    try {
      await firestore!.collection("showcase_items").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete showcase item" });
    }
  });

  // --- Site Settings ---

  app.get("/api/site-settings", async (req, res) => {
    try {
      const settingsDoc = await firestore!.collection("site_settings").doc("1").get();
      res.json(settingsDoc.exists ? { id: settingsDoc.id, ...settingsDoc.data() } : {});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/site-settings", async (req, res) => {
    const { 
      title, description, hero_image, logo_url, contact_phone, 
      whatsapp_number, facebook_url, announcement, bkash_number, 
      nagad_number, rocket_number, enable_bkash, enable_nagad, enable_rocket, enable_recruitment, address,
      smtp_host, smtp_port, smtp_user, smtp_pass, sender_email,
      firebase_service_account,
      show_features_directly, show_food_directly, show_showcase_directly, showcase_content,
      admission_rules,
      enable_neon_light, neon_light_color, neon_light_effect
    } = req.body;
    try {
      await firestore!.collection("site_settings").doc("1").set({
        title: title || "", description: description || "", hero_image: hero_image || "", logo_url: logo_url || "", contact_phone: contact_phone || "", 
        whatsapp_number: whatsapp_number || "", facebook_url: facebook_url || "", announcement: announcement || "", bkash_number: bkash_number || "", 
        nagad_number: nagad_number || "", rocket_number: rocket_number || "",
        enable_bkash: enable_bkash ? 1 : 0, enable_nagad: enable_nagad ? 1 : 0, enable_rocket: enable_rocket ? 1 : 0,
        enable_recruitment: enable_recruitment ? 1 : 0, address: address || "",
        smtp_host: smtp_host || "", smtp_port: smtp_port || "", smtp_user: smtp_user || "", smtp_pass: smtp_pass || "", sender_email: sender_email || "",
        firebase_service_account: firebase_service_account || "",
        show_features_directly: show_features_directly ? 1 : 0, 
        show_food_directly: show_food_directly ? 1 : 0, 
        show_showcase_directly: show_showcase_directly ? 1 : 0, 
        showcase_content: showcase_content || '[]',
        admission_rules: admission_rules || "",
        enable_neon_light: enable_neon_light ? 1 : 0,
        neon_light_color: neon_light_color || "#10b981",
        neon_light_effect: neon_light_effect || "pulse"
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
      const foodMenuSnapshot = await firestore!.collection("food_menu").get();
      const foodMenu = foodMenuSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() as any }))
        .filter(item => item.is_active === 1)
        .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      res.json(foodMenu);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch food menu" });
    }
  });

  app.post("/api/admin/food-menu", async (req, res) => {
    const { title, description, image_url, is_active } = req.body;
    try {
      await firestore!.collection("food_menu").add({ 
        title, 
        description, 
        image_url, 
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
    try {
      await firestore!.collection("food_menu").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete food menu" });
    }
  });

  app.put("/api/admin/food-menu/:id", async (req, res) => {
    const { title, description, image_url, is_active } = req.body;
    try {
      await firestore.collection("food_menu").doc(req.params.id).update({ 
        title, 
        description, 
        image_url,
        is_active: is_active !== undefined ? Number(is_active) : 1
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update food menu" });
    }
  });

  // --- Class Promotion ---
  app.post("/api/admin/promote-class", async (req, res) => {
    const { password } = req.body;
    if (password !== (process.env.VITE_ADMIN_PASSWORD || "1234") && password !== "১২৩৪") {
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

  // --- Teachers ---
  app.get("/api/admin/teachers", async (req, res) => {
    try {
      const teachersSnapshot = await firestore!.collection("teachers").get();
      const teachers = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(teachers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch teachers" });
    }
  });

  app.post("/api/admin/teachers", async (req, res) => {
    const { name, address, qualification, photo_url, salary, phone, email, dob, join_date, nid } = req.body;
    try {
      await firestore!.collection("teachers").add({ name, address, qualification, photo_url, salary, phone, email, dob, join_date, nid });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to add teacher" });
    }
  });

  app.put("/api/admin/teachers/:id", async (req, res) => {
    const { name, address, qualification, photo_url, salary, phone, email, dob, join_date, nid } = req.body;
    try {
      await firestore.collection("teachers").doc(req.params.id).update({ name, address, qualification, photo_url, salary, phone, email, dob, join_date, nid });
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
    if (password !== (process.env.VITE_ADMIN_PASSWORD || "1234") && password !== "১২৩৪") {
      return res.status(401).json({ error: "ভুল পাসওয়ার্ড!" });
    }
    try {
      const teacherDoc = await firestore.collection("teachers").doc(req.params.id).get();
      if (teacherDoc.exists) {
        await firestore.collection("delete_history").add({
          type: 'teacher',
          details: JSON.stringify({ id: teacherDoc.id, ...teacherDoc.data() }),
          deleted_at: new Date().toISOString()
        });
        await firestore.collection("teachers").doc(req.params.id).delete();
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete teacher" });
    }
  });

  app.delete("/api/admin/teachers/salary/:id", async (req, res) => {
    const { password } = req.body;
    if (password !== (process.env.VITE_ADMIN_PASSWORD || "1234") && password !== "১২৩৪") {
      return res.status(401).json({ error: "ভুল পাসওয়ার্ড!" });
    }
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

  app.get("/api/admin/accounting/summary", async (req, res) => {
    const { start_date, end_date } = req.query;
    try {
      let feesQuery: any = firestore.collection("fees").where("status", "==", "paid");
      let incomeQuery: any = firestore.collection("income");
      let expenseQuery: any = firestore.collection("expenses");

      if (start_date && end_date) {
        feesQuery = feesQuery.where("paid_date", ">=", start_date).where("paid_date", "<=", end_date);
        incomeQuery = incomeQuery.where("date", ">=", start_date).where("date", "<=", end_date);
        expenseQuery = expenseQuery.where("date", ">=", start_date).where("date", "<=", end_date);
      }

      const [feesSnapshot, incomeSnapshot, expenseSnapshot] = await Promise.all([
        feesQuery.get(),
        incomeQuery.get(),
        expenseQuery.get()
      ]);

      const feeIncome = feesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      const otherIncome = incomeSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      const totalIncome = feeIncome + otherIncome;
      const totalExpense = expenseSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

      res.json({ 
        totalIncome, 
        feeIncome,
        otherIncome,
        totalExpense, 
        balance: totalIncome - totalExpense 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  });

  app.get("/api/admin/accounting/income", async (req, res) => {
    const { start_date, end_date, limit = 50, offset = 0, search } = req.query;
    try {
      let feesQuery: any = firestore.collection("fees").where("status", "==", "paid");
      let incomeQuery: any = firestore.collection("income");

      if (start_date && end_date) {
        feesQuery = feesQuery.where("paid_date", ">=", start_date).where("paid_date", "<=", end_date);
        incomeQuery = incomeQuery.where("date", ">=", start_date).where("date", "<=", end_date);
      }

      const [feesSnapshot, incomeSnapshot] = await Promise.all([
        feesQuery.get(),
        incomeQuery.get()
      ]);

      const feeIncome = feesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Fee' } as any));
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
    const { category, description, amount, date, purpose } = req.body;
    try {
      await firestore.collection("income").add({
        category,
        description,
        amount: Number(amount),
        date: date || new Date().toISOString(),
        purpose
      });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to add income" });
    }
  });

  app.delete("/api/admin/accounting/income/:id", async (req, res) => {
    const { password } = req.body;
    if (password !== (process.env.VITE_ADMIN_PASSWORD || "1234") && password !== "১২৩৪") {
      return res.status(401).json({ error: "ভুল পাসওয়ার্ড!" });
    }
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
    const { start_date, end_date, limit = 50, offset = 0, search } = req.query;
    try {
      let query: any = firestore.collection("expenses");
      if (start_date && end_date) {
        query = query.where("date", ">=", start_date).where("date", "<=", end_date);
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
    const { category, description, amount, date, purpose } = req.body;
    try {
      await firestore.collection("expenses").add({
        category,
        description,
        amount: Number(amount),
        date: date || new Date().toISOString(),
        purpose
      });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to add expense" });
    }
  });

  app.delete("/api/admin/accounting/expenses/:id", async (req, res) => {
    const { password } = req.body;
    if (password !== (process.env.VITE_ADMIN_PASSWORD || "1234") && password !== "১২৩৪") {
      return res.status(401).json({ error: "ভুল পাসওয়ার্ড!" });
    }
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
      
      const batch = firestore.batch();
      const setupRef = firestore.collection("fee_setups").doc();
      batch.set(setupRef, {
        name,
        type: 'exam',
        className,
        amount: Number(amount),
        month: null,
        created_at: new Date().toISOString()
      });

      for (const student of students as any[]) {
        let feeAmount = amount;
        if (classAmounts && classAmounts[student.class]) {
          feeAmount = Number(classAmounts[student.class]);
        }

        const category = name;
        const feeRef = firestore.collection("fees").doc();
        batch.set(feeRef, {
          student_id: student.id,
          category,
          amount: Number(feeAmount),
          due_date: new Date().toISOString().split('T')[0],
          status: 'unpaid',
          setup_id: setupRef.id,
          created_at: new Date().toISOString()
        });
      }
      
      await batch.commit();
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
    if (password !== (process.env.VITE_ADMIN_PASSWORD || "1234") && password !== "১২৩৪") return res.status(403).json({ error: "ভুল পাসওয়ার্ড" });

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
        if (a.roll !== b.roll) return (Number(a.roll) || 0) - (Number(b.roll) || 0);
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
      const batch = firestore.batch();
      const transactionId = `TRX-${Date.now()}`;
      
      for (const id of fee_ids) {
        const amount = paid_amounts[id];
        const feeRef = firestore.collection("fees").doc(id);
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
      res.json({ success: true });
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
        return (Number(a.roll) || 0) - (Number(b.roll) || 0);
      });

      if (limit) {
        const l = parseInt(limit as string);
        const o = offset ? parseInt(offset as string) : 0;
        students = students.slice(o, o + l);
      }

      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
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
        const exams = [...new Set(results.map((r: any) => r.exam_name))];
        for (const exam of exams) {
          const classStudentsSnapshot = await firestore.collection("students").where("class", "==", student.class).where("deleted_at", "==", null).get();
          const classStudentIds = classStudentsSnapshot.docs.map(s => s.id);

          const allExamResultsSnapshot = await firestore.collection("results").where("exam_name", "==", exam).get();
          const allExamResults = allExamResultsSnapshot.docs.map(doc => doc.data() as any).filter(r => classStudentIds.includes(r.student_id));

          const studentTotals: any = {};
          allExamResults.forEach(r => {
            studentTotals[r.student_id] = (studentTotals[r.student_id] || 0) + r.marks;
          });

          const sortedTotals = Object.entries(studentTotals).map(([id, total]) => ({ student_id: id, total })).sort((a: any, b: any) => b.total - a.total);

          const myRankIndex = sortedTotals.findIndex(m => m.student_id === studentId);
          const myTotal = studentTotals[studentId] || 0;
          const highest = sortedTotals.length > 0 ? sortedTotals[0].total : 0;

          examStats[exam] = {
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
    const { name, father_name, mother_name, dob, blood_group, address, phone, whatsapp, email, className, is_hifz, photo_url, roll: providedRoll, monthly_fee, studentId: providedStudentId } = req.body;
    
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
        roll,
        name,
        father_name,
        mother_name,
        dob,
        blood_group,
        address,
        phone,
        whatsapp,
        email,
        class: className,
        is_hifz: (is_hifz || className === "হিফজ") ? 1 : 0,
        photo_url,
        monthly_fee: monthly_fee || 0,
        student_code: studentCode,
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
    const { name, father_name, mother_name, dob, blood_group, address, phone, whatsapp, email, className, roll, is_hifz, photo_url, monthly_fee, student_code } = req.body;
    try {
      if (student_code) {
        const existingSnapshot = await firestore.collection("students").where("student_code", "==", student_code).get();
        const existing = existingSnapshot.docs.find(doc => doc.id !== req.params.id);
        if (existing) {
          return res.status(400).json({ error: "এই স্টুডেন্ট আইডি ইতিমধ্যে ব্যবহৃত হয়েছে।" });
        }
      }

      const updateData: any = {
        name, father_name, mother_name, dob, 
        blood_group, address, phone, whatsapp, email, class: className, 
        roll, is_hifz: (is_hifz || className === "হিফজ") ? 1 : 0, photo_url, 
        monthly_fee: monthly_fee || 0, student_code,
        updated_at: new Date().toISOString()
      };

      await firestore.collection("students").doc(req.params.id).update(updateData);
      res.json({ success: true });
    } catch (error) {
      console.error("Student update error:", error);
      res.status(500).json({ error: "ছাত্রের তথ্য আপডেট করা সম্ভব হয়নি।" });
    }
  });

  app.delete("/api/admin/students/:id", async (req, res) => {
    const { password } = req.body;
    const queryPassword = req.query.password;
    
    if ((password !== (process.env.VITE_ADMIN_PASSWORD || "1234") && password !== "১২৩৪") && (queryPassword !== (process.env.VITE_ADMIN_PASSWORD || "1234") && queryPassword !== "১২৩৪")) {
      return res.status(401).json({ error: "Invalid password" });
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

  app.post("/api/admission", async (req, res) => {
    const { name, father_name, mother_name, dob, blood_group, address, phone, whatsapp, email, className, is_hifz, photo_url } = req.body;
    try {
      await firestore.collection("admissions").add({
        name, father_name, mother_name, dob, blood_group, address, phone, whatsapp, email, class: className, 
        is_hifz: is_hifz ? 1 : 0, photo_url,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Admission application failed" });
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
        roll,
        name: application.name,
        father_name: application.father_name,
        mother_name: application.mother_name,
        dob: application.dob,
        blood_group: application.blood_group,
        address: application.address,
        phone: application.phone,
        whatsapp: application.whatsapp,
        email: application.email,
        class: application.class,
        is_hifz: application.is_hifz,
        photo_url: application.photo_url,
        student_code: studentCode,
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
      const studentsSnapshot = await firestore.collection("students").where("class", "==", className).where("deleted_at", "==", null).get();
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      const attendanceSnapshot = await firestore.collection("attendance").where("date", "==", date).get();
      const attendance = attendanceSnapshot.docs.map(doc => doc.data() as any);
      
      const result = students.map((s: any) => ({
        ...s,
        status: attendance.find((a: any) => a.student_id === s.id)?.status || null
      }));
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance/bulk", async (req, res) => {
    const { date, records } = req.body;
    try {
      const batch = firestore.batch();
      for (const record of records) {
        const attendanceSnapshot = await firestore.collection("attendance").where("student_id", "==", record.student_id).where("date", "==", date).get();
        attendanceSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        if (record.status) {
          const newRef = firestore.collection("attendance").doc();
          batch.set(newRef, {
            student_id: record.student_id,
            date,
            status: record.status,
            created_at: new Date().toISOString()
          });
        }
      }
      await batch.commit();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save attendance" });
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

  app.get("/api/parent/device-history/:studentId", async (req, res) => {
    const { studentId } = req.params;
    try {
      const historySnapshot = await firestore.collection("attendance_history")
        .where("id", "==", studentId)
        .orderBy("timestamp", "desc")
        .limit(30)
        .get();
      
      const history = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json(history);
    } catch (error) {
      console.error("Fetch parent history error:", error);
      res.status(500).json({ error: "Failed to fetch device history" });
    }
  });

  // --- Results ---
  app.get("/api/admin/results/class/:className", async (req, res) => {
    const { className } = req.params;
    const { exam_name } = req.query;
    try {
      const studentsSnapshot = await firestore.collection("students").where("class", "==", className).where("deleted_at", "==", null).get();
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      const resultsSnapshot = await firestore.collection("results").where("exam_name", "==", exam_name).get();
      const results = resultsSnapshot.docs.map(doc => doc.data() as any);
      
      const data = students.map((s: any) => {
        const studentResults = results.filter((r: any) => r.student_id === s.id);
        const totalMarks = studentResults.reduce((sum: number, r: any) => sum + r.marks, 0);
        const avgMarks = studentResults.length > 0 ? totalMarks / studentResults.length : 0;
        return {
          ...s,
          subjects: studentResults,
          totalMarks,
          avgMarks
        };
      });

      data.sort((a, b) => b.totalMarks - a.totalMarks);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  app.post("/api/results", async (req, res) => {
    const { student_id, exam_name, subject, marks, grade, date } = req.body;
    try {
      await firestore.collection("results").add({
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
      const snapshot = await firestore.collection("results").where("student_id", "==", req.params.studentId).get();
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
      let notices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      notices.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.json(notices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notices" });
    }
  });

  app.post("/api/notices", async (req, res) => {
    const { title, content } = req.body;
    try {
      await firestore.collection("notices").add({
        title,
        content,
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
    const { title, content, is_active } = req.body;
    try {
      await firestore.collection("notices").doc(req.params.id).update({
        title,
        content,
        is_active: is_active !== undefined ? Number(is_active) : 1,
        updated_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update notice" });
    }
  });

  app.delete("/api/admin/notices/:id", async (req, res) => {
    try {
      await firestore.collection("notices").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete notice" });
    }
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
    try {
      const snapshot = await firestore.collection("subjects").where("class", "==", req.params.className).get();
      const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    const { className, name, full_marks } = req.body;
    try {
      await firestore.collection("subjects").add({
        class: className,
        name,
        full_marks: full_marks || 100,
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add subject" });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      await firestore.collection("subjects").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subject" });
    }
  });

  // --- Parent Login ---
  app.post("/api/parent-login", async (req, res) => {
    const identifier = req.body.identifier?.trim();
    
    if (!identifier) {
      return res.status(400).json({ error: "মোবাইল নম্বর, ইমেইল বা স্টুডেন্ট কোড দিন।" });
    }

    try {
      // Check phone
      let snapshot = await firestore.collection("students").where("phone", "==", identifier).where("deleted_at", "==", null).get();
      if (snapshot.empty) {
        // Check email
        snapshot = await firestore.collection("students").where("email", "==", identifier).where("deleted_at", "==", null).get();
      }
      if (snapshot.empty) {
        // Check student_code
        snapshot = await firestore.collection("students").where("student_code", "==", identifier).where("deleted_at", "==", null).get();
      }

      if (snapshot.empty) {
        return res.status(401).json({ error: "মোবাইল নম্বর, ইমেইল বা স্টুডেন্ট কোড সঠিক নয়।" });
      }

      const student = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/parent/pay-fee", async (req, res) => {
    const { studentId, months, year, amount, method } = req.body;
    try {
      const settingsDoc = await firestore!.collection("settings").doc("general").get();
      const settings = settingsDoc.data() || {};
      
      const studentDoc = await firestore!.collection("students").doc(studentId).get();
      if (!studentDoc.exists) return res.status(404).json({ error: "Student not found" });
      const student = studentDoc.data();

      // Create a pending transaction
      const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
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
        createdAt: new Date().toISOString()
      };
      
      await firestore!.collection("pending_payments").doc(transactionId).set(pendingPayment);

      if (method === "udyoktapay") {
        if (!settings.udyoktapay_api_key || !settings.udyoktapay_api_url) {
          return res.status(400).json({ error: "Udyokta Pay is not configured." });
        }

        const payload = {
          full_name: student?.name || "Student",
          email: student?.email || "student@example.com",
          amount: amount,
          metadata: {
            transactionId
          },
          redirect_url: `${req.protocol}://${req.get('host')}/parent?payment=success`,
          cancel_url: `${req.protocol}://${req.get('host')}/parent?payment=cancel`,
          webhook_url: `${req.protocol}://${req.get('host')}/api/udyoktapay/webhook`
        };

        const response = await fetch(settings.udyoktapay_api_url, {
          method: "POST",
          headers: {
            "RT-UDYOKTAPAY-API-KEY": settings.udyoktapay_api_key,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.status && data.payment_url) {
          return res.json({ payment_url: data.payment_url });
        } else {
          return res.status(500).json({ error: "Failed to initiate payment with Udyokta Pay." });
        }
      } else {
        // Manual payment (bKash/Nagad/Rocket personal number)
        return res.json({ success: true, transactionId, message: "Please send money and provide TrxID." });
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Payment initiation failed" });
    }
  });

  app.post("/api/udyoktapay/webhook", async (req, res) => {
    const { status, metadata, amount } = req.body;
    
    try {
      const apiKeyHeader = req.headers['rt-udyoktapay-api-key'];
      const settingsDoc = await firestore!.collection("settings").doc("general").get();
      const settings = settingsDoc.data() || {};
      
      if (apiKeyHeader !== settings.udyoktapay_api_key) {
        return res.status(401).send("Unauthorized");
      }

      if (status === "COMPLETED" && metadata?.transactionId) {
        const txDoc = await firestore!.collection("pending_payments").doc(metadata.transactionId).get();
        if (txDoc.exists) {
          const txData = txDoc.data();
          if (txData?.status === "pending") {
            // Mark as paid
            await firestore!.collection("pending_payments").doc(metadata.transactionId).update({ status: "completed" });
            
            // Create fee records
            const receiptNumber = `REC-${Date.now()}`;
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

  app.get("/api/admin/pending-payments", async (req, res) => {
    try {
      const snapshot = await firestore!.collection("pending_payments").where("status", "==", "pending").get();
      const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending payments" });
    }
  });

  app.post("/api/admin/pending-payments/:id/approve", async (req, res) => {
    const { id } = req.params;
    try {
      const txDoc = await firestore!.collection("pending_payments").doc(id).get();
      if (!txDoc.exists) return res.status(404).json({ error: "Transaction not found" });
      
      const txData = txDoc.data();
      await firestore!.collection("pending_payments").doc(id).update({ status: "completed" });
      
      const receiptNumber = `REC-${Date.now()}`;
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
    if (password !== (process.env.VITE_ADMIN_PASSWORD || "1234") && password !== "১২৩৪") return res.status(401).json({ error: "ভুল পাসওয়ার্ড" });

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
    if (password !== (process.env.VITE_ADMIN_PASSWORD || "1234") && password !== "১২৩৪") return res.status(401).json({ error: "ভুল পাসওয়ার্ড" });

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
    if (password !== (process.env.VITE_ADMIN_PASSWORD || "1234") && password !== "১২৩৪") return res.status(401).json({ error: "ভুল পাসওয়ার্ড" });

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

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: 0,
        },
        watch: null
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.log('Address in use, retrying...');
      setTimeout(() => {
        server.close();
        server.listen(PORT, "0.0.0.0");
      }, 1000);
    }
  });
}

startServer();
