const http = require('http');

const endpoints = [
  "/api/site-settings",
  "/api/notices",
  "/api/food-menu",
  "/api/routines",
  "/api/admin/pending-counts",
  "/api/admin/device-history",
  "/api/admin/amal-tasks",
  "/api/admin/settings/hifz",
  "/api/admin/dashboard-stats",
  "/api/admin/teachers",
  "/api/admin/biometric/history",
  "/api/admin/syllabus-routines",
  "/api/admin/job-applications",
  "/api/admin/archive/teachers",
  "/api/admin/archive/students?limit=1000",
  "/api/admin/students/breakdown",
  "/api/amal-tasks?target=student",
  "/api/amal-tasks?target=teacher",
  "/api/leaderboard?type=amol",
  "/api/top-students?type=all",
  "/api/health",
  "/api/students?limit=10",
  "/api/fees/stats",
  "/api/parent/device-history/dummy",
  "/api/parent/payment-history/dummy",
  "/api/teacher/salary-history/dummy"
];

async function check(url) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${url}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isHtml = data.trim().toLowerCase().startsWith('<!doctype') || data.trim().toLowerCase().startsWith('<html');
        resolve({ url, status: res.statusCode, isHtml, preview: data.slice(0, 100) });
      });
    }).on('error', (e) => {
      resolve({ url, status: 0, isHtml: false, error: e.message });
    });
  });
}

(async () => {
  for (const ep of endpoints) {
    const res = await check(ep);
    if (res.isHtml || res.status >= 400) {
      console.log(`❌ FAILED: ${res.url} -> Status: ${res.status}, HTML: ${res.isHtml}, Preview: ${res.preview.replace(/\n/g, ' ')}`);
    } else {
      console.log(`✅ OK: ${res.url} -> Status: ${res.status}`);
    }
  }
})();
