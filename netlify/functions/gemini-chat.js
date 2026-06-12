// netlify/functions/gemini-chat.js
exports.handler = async function(event, context) {
  const allowedOrigins = ["https://kirmada.online", "http://localhost:8888", "http://localhost:5500", "http://127.0.0.1:5500"];
  const origin = event.headers.origin || event.headers.Origin;
  
  const corsOrigin = allowedOrigins.includes(origin) ? origin : "https://kirmada.online";

  // Handle CORS Preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  // Security: Block unauthorized origins
  if (origin && !allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Forbidden: Unauthorized Origin" })
    };
  }

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
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": corsOrigin
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
