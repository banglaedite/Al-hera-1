const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/password !== "1234"/g, 'password !== (process.env.VITE_ADMIN_PASSWORD || "1234")');
content = content.replace(/queryPassword !== "1234"/g, 'queryPassword !== (process.env.VITE_ADMIN_PASSWORD || "1234")');
fs.writeFileSync('server.ts', content);
