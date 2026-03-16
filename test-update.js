import Database from 'better-sqlite3';

const db = new Database('madrasa.db');

try {
  const result = db.prepare(`
    UPDATE site_settings SET 
      title = ?, description = ?, hero_image = ?, logo_url = ?,
      contact_phone = ?, whatsapp_number = ?, 
      facebook_url = ?, announcement = ?,
      bkash_number = ?, nagad_number = ?,
      enable_recruitment = ?, address = ?,
      smtp_host = ?, smtp_port = ?, smtp_user = ?, smtp_pass = ?, sender_email = ?,
      firebase_service_account = ?,
      show_features_as_buttons = ?, show_food_as_buttons = ?, show_showcase_as_buttons = ?, showcase_content = ?
    WHERE id = 1
  `).run(
    "Test Title", "Test Desc", "hero.png", "logo.png", "123", 
    "123", "fb.com", "ann", "bkash", 
    "nagad", 1, "address",
    "smtp", 587, "user", "pass", "email",
    "firebase",
    1, 1, 1, "[]"
  );
  console.log("Success:", result);
} catch (error) {
  console.error("Error:", error);
}
