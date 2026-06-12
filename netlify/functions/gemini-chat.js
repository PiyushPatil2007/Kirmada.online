// netlify/functions/gemini-chat.js
exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: { message: "Server configuration error: Missing GEMINI_API_KEY environment variable in Netlify." } }) 
    };
  }

  try {
    const body = JSON.parse(event.body);
    const contents = body.contents;

    // We use gemini-3.5-flash
    // The new AQ. keys must be passed via the x-goog-api-key header instead of ?key=
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY 
      },
      body: JSON.stringify({ contents: contents })
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        statusCode: response.status, 
        body: JSON.stringify(data) 
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Netlify Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: "Internal Server Error: " + error.message } })
    };
  }
};
