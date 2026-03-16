import Database from "better-sqlite3";
try {
  const db = new Database("madrasa.db");
  const newDb = new Database("madrasa_new.db");

  // Get all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

  for (const table of tables) {
    if (table.name === "sqlite_sequence") continue;
    console.log(`Copying table ${table.name}`);
    try {
      const rows = db.prepare(`SELECT * FROM ${table.name}`).all();
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => "?").join(",");
        
        // Create table in new DB
        const createTable = db.prepare(`SELECT sql FROM sqlite_master WHERE name='${table.name}'`).get();
        newDb.exec(createTable.sql);
        
        const insert = newDb.prepare(`INSERT INTO ${table.name} (${columns.map(c => `"${c}"`).join(",")}) VALUES (${placeholders})`);
        for (const row of rows) {
          insert.run(Object.values(row));
        }
      }
    } catch (e) {
      console.error(`Could not copy table ${table.name}:`, e.message);
    }
  }
  console.log("Database copied successfully");
} catch (e) {
  console.error("Database error:", e.message);
}
