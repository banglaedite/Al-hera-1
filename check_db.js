import Database from "better-sqlite3";
const db = new Database("madrasa.db");
const count = db.prepare("SELECT COUNT(*) as count FROM students").get();
console.log("Student count:", count.count);
const students = db.prepare("SELECT id, name FROM students").all();
console.log("Students:", students);
