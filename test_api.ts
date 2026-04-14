
async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/admission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Student" })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text.substring(0, 500));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
test();
