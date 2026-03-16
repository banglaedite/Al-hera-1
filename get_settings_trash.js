import Database from "better-sqlite3";
try {
  const db = new Database("madrasa_trash.db");
  const settings = db.prepare("SELECT * FROM site_settings").all();
  console.log(JSON.stringify(settings));
} catch (e) {
  console.error("Error:", e.message);
}
