import Database from "better-sqlite3";
import fs from "fs";

try {
  console.log("Attempting to repair database...");
  if (fs.existsSync("madrasa.db")) {
    // Try to open it to confirm corruption
    const db = new Database("madrasa.db");
    console.log("Database opened successfully. It might not be corrupted.");
    db.close();
  } else {
    console.log("Database file not found.");
  }
} catch (e) {
  console.log("Database is corrupted, attempting repair...");
  // SQLite repair usually involves dumping and restoring
  // Since we can't easily run sqlite3 CLI, we'll try to rename and create a new one
  // and hope the app handles it or we can recover from trash.
  fs.renameSync("madrasa.db", "madrasa_corrupted.db");
  console.log("Corrupted database renamed to madrasa_corrupted.db");
  
  // Try to restore from trash if exists
  if (fs.existsSync("madrasa_trash.db")) {
    fs.copyFileSync("madrasa_trash.db", "madrasa.db");
    console.log("Restored from madrasa_trash.db");
  } else {
    console.log("No trash database found to restore from.");
  }
}
