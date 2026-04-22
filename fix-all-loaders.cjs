const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.tsx')) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('src');

const customLoaderHtml = `<div className="relative flex items-center justify-center w-12 h-12 mx-auto">
  <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100"></div>
  <div className="absolute inset-0 rounded-full border-t-[3px] border-t-emerald-500 border-b-[3px] border-b-rose-500 animate-spin"></div>
  <div className="absolute inset-2 rounded-full border-l-[3px] border-l-rose-500 border-r-[3px] border-r-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
</div>`;

const customSmallLoaderHtml = `<div className="relative flex justify-center items-center w-5 h-5">
  <div className="absolute inset-0 rounded-full border-2 border-emerald-100/30"></div>
  <div className="absolute inset-0 rounded-full border-t-2 border-t-emerald-500 border-b-2 border-b-rose-500 animate-spin"></div>
</div>`;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace large loaders (w-8, w-10, w-12 or custom classes with animate-spin)
  content = content.replace(/<Loader2\s+className="w-(8|10|12)\s+h-\1[^"]*"\s*\/>/g, customLoaderHtml);
  content = content.replace(/<Loader2\s+className="w-8\s+h-8\s+animate-spin[^"]*"\s*\/>/g, customLoaderHtml);
  
  // Replace small loaders in buttons (w-4, w-5, w-6)
  content = content.replace(/<Loader2\s+className="w-(4|5|6)\s+h-\1[^"]*"\s*\/>/g, customSmallLoaderHtml);
  
  // Replace Loader2 with cn(...) which is used in AdminPanel line 8399
  content = content.replace(/<Loader2\s+className=\{cn\([^)]+\)\}\s*\/>/g, customSmallLoaderHtml);
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated loaders in ${file}`);
  }
}
