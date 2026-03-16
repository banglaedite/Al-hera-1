const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
content = content.replace(/deletePassword === "1234"/g, '(deletePassword === "1234" || deletePassword === "১২৩৪")');
content = content.replace(/deletePassword !== "1234"/g, '(deletePassword !== "1234" && deletePassword !== "১২৩৪")');
fs.writeFileSync('src/components/AdminPanel.tsx', content);
