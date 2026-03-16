import Database from "better-sqlite3";
try {
  const db = new Database("madrasa_trash.db");
  console.log("madrasa_trash.db opened successfully");
  db.close();
} catch (e) {
  console.error("madrasa_trash.db error:", e.message);
}
