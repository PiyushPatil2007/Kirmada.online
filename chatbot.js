import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const chatToggle = document.getElementById('ai-chat-toggle');
  const chatWindow = document.getElementById('ai-chat-window');
  const chatClose = document.getElementById('ai-chat-close');
  const chatMessages = document.getElementById('ai-chat-messages');
  const chatInput = document.getElementById('ai-chat-input');
  const chatSendBtn = document.getElementById('ai-chat-send');

  let isChatOpen = false;
  let isFirstOpen = true;

  // ==========================================
  // GEMINI AI CONFIGURATION (NATIVE REST API)
  // ==========================================
  const API_KEY = "AQ.Ab8RN6J4IAk_LNNgKQmxrG4kFp3wYJJ5VlYNxSGOKdyBnmEdyw";
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=" + API_KEY;
  
  // Custom manual history array
  let chatHistory = [];
  
  // Initialize System Prompt
  chatHistory.push({
    role: "user",
    parts: [{ text: "System Instruction: You are the Kirmada Assistant, the official AI representative for Kirmada.Online (an elite web development and AI agency). CRITICAL RULES: 1. You are fluent in all languages. Always respond in the EXACT same language the user is speaking to you in. If they speak English, use very simple, clear English. 2. Keep all responses VERY short (1-2 sentences maximum). Do NOT write paragraphs. 3. If the user asks for contact info or social media, you MUST reply using this exact HTML block to ensure 1 link per line: <ul style='margin:10px 0; padding-left:20px;'><li style='margin-bottom:8px;'><a href='https://wa.me/919028551638' target='_blank' style='color:#ea2804; font-weight:bold; text-decoration:underline;'>WhatsApp (+91 9028551638)</a></li><li style='margin-bottom:8px;'><a href='https://www.instagram.com/kirmada.online/' target='_blank' style='color:#ea2804; font-weight:bold; text-decoration:underline;'>Instagram (@kirmada.online)</a></li><li style='margin-bottom:8px;'><a href='https://x.com/kirmadaonline' target='_blank' style='color:#ea2804; font-weight:bold; text-decoration:underline;'>X (Twitter)</a></li><li style='margin-bottom:8px;'><a href='https://www.facebook.com/profile.php?id=61590268064411' target='_blank' style='color:#ea2804; font-weight:bold; text-decoration:underline;'>Facebook</a></li></ul> 4. Your ultimate goal is lead capture. Casually ask for the visitor's email address to follow up. 5. Never break character. Never say you are an AI or language model."}]
  });
  
  // Inject live offer data into system prompt
  async function fetchAndInjectOffer() {
    try {
      const docSnap = await getDoc(doc(db, "offers", "current"));
      if (docSnap.exists() && docSnap.data().active) {
        const data = docSnap.data();
        const endTime = new Date(data.endTime).getTime();
        const now = new Date().getTime();
        
        if (endTime > now) {
          const offerContext = `\n\n6. CRITICAL OFFER INFO: We currently have a live exclusive offer titled "${data.headline}". The details are: ${data.description}. Discount: ${data.discount}%. Spots remaining: ${data.spots}. If the user asks about offers, discounts, or pricing, YOU MUST mention this offer explicitly!`;
          chatHistory[0].parts[0].text += offerContext;
        }
      }
    } catch (e) {
      console.error("Error fetching offer for chatbot:", e);
    }
  }
  fetchAndInjectOffer();
  chatHistory.push({
    role: "model",
    parts: [{ text: "Understood. I will act as the Kirmada Assistant, matching the user's exact language fluently, keeping responses extremely short (1-2 sentences), using properly spaced HTML bullet links for social media, and asking for email addresses."}]
  });

  // ==========================================
  // UI LOGIC
  // ==========================================
  function toggleChat() {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
      chatWindow.classList.remove('hidden');
      chatToggle.style.transform = 'scale(0)';
      setTimeout(() => chatInput.focus(), 300);
      
      // Send the initial language selection greeting
      if (isFirstOpen) {
        isFirstOpen = false;
        setTimeout(() => {
          appendMessage("Hello! 👋 Welcome to Kirmada.Online. <br><br>Please reply with your preferred language to begin (English, Spanish, French, Hindi, etc.)", false);
          // Add this initial message to the chat history so the AI has context
          chatHistory.push({ role: "model", parts: [{ text: "Hello! 👋 Welcome to Kirmada.Online. \n\nPlease reply with your preferred language to begin (English, Spanish, French, Hindi, etc.)" }] });
        }, 600);
      }
    } else {
      chatWindow.classList.add('hidden');
      chatToggle.style.transform = 'scale(1)';
    }
  }

  chatToggle.addEventListener('click', toggleChat);
  chatClose.addEventListener('click', toggleChat);

  function appendMessage(text, isUser = false) {
    const div = document.createElement('div');
    div.className = `ai-message ${isUser ? 'user-message' : 'bot-message'}`;
    div.innerHTML = `<p style="margin:0">${text}</p>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'bot-typing';
    div.id = 'bot-typing-indicator';
    div.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTyping() {
    const indicator = document.getElementById('bot-typing-indicator');
    if (indicator) indicator.remove();
  }

  // ==========================================
  // LEAD CAPTURE LOGIC (FIREBASE)
  // ==========================================
  async function checkAndSaveEmail(text) {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const matches = text.match(emailRegex);
    
    if (matches && matches.length > 0) {
      const email = matches[0];
      console.log("Email detected:", email);
      if (window.db) {
        try {
          const { collection, addDoc, serverTimestamp } = window.firebaseFirestore;
          await addDoc(collection(window.db, "leads"), {
            email: email,
            capturedAt: serverTimestamp(),
            source: "AI Chatbot",
            messageContext: text
          });
          console.log("Lead successfully saved to Firebase!");
        } catch (e) {
          console.error("Error saving lead to Firebase:", e);
        }
      }
    }
  }

  // ==========================================
  // MESSAGE HANDLING (RAW FETCH)
  // ==========================================
  async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, true);
    chatInput.value = '';
    
    await checkAndSaveEmail(text);
    showTyping();

    if (API_KEY === "YOUR_API_KEY_HERE") {
      setTimeout(() => {
        removeTyping();
        appendMessage("The Kirmada AI is currently offline. Please set the Gemini API Key in the codebase.", false);
      }, 1000);
      return;
    }

    try {
      chatHistory.push({ role: "user", parts: [{ text: text }] });
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: chatHistory })
      });
      
      const data = await response.json();
      removeTyping();
      
      if (!response.ok) {
        console.error("Gemini API Error Data:", data);
        appendMessage(`API Error: ${data.error?.message || response.statusText}`, false);
        chatHistory.pop(); // Remove the failed message
        return;
      }
      
      const botText = data.candidates[0].content.parts[0].text;
      appendMessage(botText, false);
      chatHistory.push({ role: "model", parts: [{ text: botText }] });
      
    } catch (err) {
      console.error("Fetch Error:", err);
      removeTyping();
      appendMessage(`Network Error: ${err.message}`, false);
      chatHistory.pop();
    }
  }

  chatSendBtn.addEventListener('click', handleSendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });
});
