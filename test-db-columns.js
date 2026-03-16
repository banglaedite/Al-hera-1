const Database = require('better-sqlite3');
const db = new Database('madrasa.db');
const row = db.prepare("SELECT * FROM site_settings WHERE id = 1").get();
console.log(Object.keys(row));
