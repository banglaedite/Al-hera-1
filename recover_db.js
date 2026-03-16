import fetch from 'node-fetch';
(async () => {
  const res = await fetch('http://localhost:3000/api/admin/database/recover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: '1234' })
  });
  console.log(await res.json());
})();
