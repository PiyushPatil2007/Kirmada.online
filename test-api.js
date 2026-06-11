const API_KEY = "AQ.Ab8RN6J4IAk_LNNgKQmxrG4kFp3wYJJ5VlYNxSGOKdyBnmEdyw";

async function test() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "hi" }] }]
      })
    });
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error("ERROR:", e);
  }
}
test();
