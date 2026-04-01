const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const leaderboardApi = `
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
`;

const backupApi = `
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
        from: \`"\${settings.madrasa_name || 'Madrasa Admin'}" <\${settings.sender_email || settings.smtp_user}>\`,
        to: settings.smtp_user, // Send to admin's own email
        subject: \`Automated Database Backup - \${new Date().toLocaleDateString()}\`,
        text: "Please find attached the automated database backup.",
        attachments: [
          {
            filename: \`Backup_\${new Date().toISOString().split('T')[0]}.xlsx\`,
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

  app.post("/api/admin/trigger-backup", async (req, res) => {
    const { password } = req.body;
    if (!(await verifyAdminOrSubAdmin(password, "all"))) {
      return res.status(401).json({ error: "Invalid password" });
    }
    
    const success = await generateAndSendBackup();
    if (success) {
      res.json({ success: true, message: "Backup sent successfully" });
    } else {
      res.status(500).json({ error: "Failed to send backup. Check SMTP settings." });
    }
  });

  // Schedule backup every Friday at 11:59 PM
  cron.schedule('59 23 * * 5', () => {
    generateAndSendBackup();
  });
`;

content = content.replace('// --- Admin Stats ---', leaderboardApi + '\n' + backupApi + '\n  // --- Admin Stats ---');

fs.writeFileSync('server.ts', content);
