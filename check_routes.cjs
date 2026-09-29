const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('src');
const fetchRegex = /fetch\(\s*([`'"][^`'"]+[`'"])/g;
const matches = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = fetchRegex.exec(content)) !== null) {
    matches.push({ file: f, url: m[1] });
  }
});

console.log(`Found ${matches.length} fetch calls in src/`);
const apiCalls = matches.filter(m => m.url.includes('/api/'));
console.log(`API calls: ${apiCalls.length}`);
apiCalls.forEach(a => console.log(`${a.file} -> ${a.url}`));
