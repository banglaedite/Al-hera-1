const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');
const lines = content.split('\n');

let inRoute = false;
let routeLine = 0;
let hasTry = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (!inRoute && line.match(/app\.(get|post|put|delete)\(.*async/)) {
    inRoute = true;
    routeLine = i + 1;
    hasTry = false;
    braceCount = 0;
  }
  
  if (inRoute) {
    if (line.includes('{')) braceCount += (line.match(/\{/g) || []).length;
    if (line.includes('}')) braceCount -= (line.match(/\}/g) || []).length;
    
    if (line.includes('try {') || line.includes('try{') || line.includes('try  {')) {
      hasTry = true;
    }
    
    if (braceCount === 0 && i >= routeLine) {
      if (!hasTry) {
        console.log(`Missing try-catch at line ${routeLine}: ${lines[routeLine-1].trim()}`);
      }
      inRoute = false;
    }
  }
}
