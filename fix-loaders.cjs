const fs = require('fs');

const files = [
  'src/components/AdminPanel.tsx',
  'src/components/DashboardHome.tsx',
  'src/components/TeacherPortal.tsx',
  'src/components/ParentPortal.tsx',
  'src/components/FeeManagement.tsx',
  'src/components/StudentSearch.tsx',
  'src/components/AdmissionForm.tsx'
];

const customLoaderHtml = `<div className="relative flex items-center justify-center w-12 h-12">
  <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100"></div>
  <div className="absolute inset-0 rounded-full border-t-[3px] border-t-emerald-500 border-b-[3px] border-b-rose-500 animate-spin"></div>
  <div className="absolute inset-2 rounded-full border-l-[3px] border-l-rose-500 border-r-[3px] border-r-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
</div>`;

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace standalone <Loader2 className="..." />
    content = content.replace(/<Loader2 className="w-\d+ h-\d+[^"]*" \/>/g, customLoaderHtml);
    content = content.replace(/<Loader2 className="w-\d+ h-\d+[^"]* animate-spin[^"]*" \/>/g, customLoaderHtml);
    
    fs.writeFileSync(file, content);
    console.log(`Updated loaders in ${file}`);
  }
}
