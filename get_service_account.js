import Database from "better-sqlite3";
const db = new Database("madrasa.db");
const settings = db.prepare("SELECT firebase_service_account FROM site_settings WHERE id = 1").get();
console.log(JSON.stringify(settings));
