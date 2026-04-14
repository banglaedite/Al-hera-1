import fs from 'fs';

const content = fs.readFileSync('server.ts', 'utf-8');
const lines = content.split('\n');

// Match app.get/post/put/delete with async handlers
const routeRegex = /app\.(get|post|put|delete)\("(\/api\/[^"]+)",\s*async\s*\(/g;
let match;

while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1];
    const path = match[2];
    const index = match.index;
    
    // Look ahead for 'try {' within the next 100 characters
    const snippet = content.substring(index, index + 300);
    if (!snippet.includes('try {')) {
        const lineNum = content.substring(0, index).split('\n').length;
        console.log(`Missing try-catch at line ${lineNum}: ${method.toUpperCase()} ${path}`);
    }
}
