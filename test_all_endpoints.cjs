const fs = require('fs');
const http = require('http');

const content = fs.readFileSync('check_routes.cjs', 'utf8');
const files = [];
function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = dir + '/' + file;
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) files.push(full);
  });
}
walk('src');

const urlRegex = /fetch\(\s*([`'"][^`'"]+[`'"])/g;
const urls = new Set();
files.forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = urlRegex.exec(code)) !== null) {
    let u = m[1];
    if (u.includes('/api/')) {
      // remove surrounding quotes
      u = u.replace(/^[`'"]|[`'"]$/g, '');
      // replace template variables with dummy
      u = u.replace(/\${[^}]+}/g, 'dummy');
      urls.add(u);
    }
  }
});

console.log(`Found ${urls.size} unique API endpoints.`);

async function check(url) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${url}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isHtml = data.trim().toLowerCase().startsWith('<!doctype') || data.trim().toLowerCase().startsWith('<html');
        resolve({ url, status: res.statusCode, isHtml, preview: data.slice(0, 80) });
      });
    }).on('error', (e) => {
      resolve({ url, status: 0, isHtml: false, error: e.message });
    });
  });
}

(async () => {
  let failed = 0;
  for (const url of Array.from(urls).sort()) {
    const res = await check(url);
    if (res.isHtml) {
      console.log(`❌ RETURNS HTML (MISSING ENDPOINT?): ${res.url} -> Status: ${res.status}`);
      failed++;
    } else if (res.status === 404) {
      console.log(`⚠️ 404: ${res.url}`);
    }
  }
  console.log(`Completed. HTML returns: ${failed}`);
})();
