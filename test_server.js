async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/site-settings');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text.substring(0, 500));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
