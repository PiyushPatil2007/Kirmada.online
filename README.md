# Kirmada.Online | Digital Infrastructure & Automation

> **Aesthetics dictate trust. Speed is revenue. Automation over manual labor.**

This repository contains the source code for [Kirmada.Online](https://kirmada.online/), a premium digital marketing and web development agency. The architecture is designed for zero-lag performance, high-end visual aesthetics, and live AI integration.

## ⚡ Core Architecture

- **Frontend:** Pure semantic HTML5, Vanilla JavaScript, and highly optimized CSS variables. No bulky frameworks. Zero-lag performance.
- **Styling:** Custom "Dark Premium" design system featuring glassmorphism, dynamic cursor lenses, and smooth scroll micro-animations.
- **Backend:** Netlify Serverless Functions (`gemini-chat.js`) executing live API calls securely without exposing keys to the client.
- **AI Integration:** Direct integration with Google's Gemini AI, powering a live interactive "Sandbox" that generates bespoke marketing strategies on the fly.
- **Technical SEO:** Fully automated JSON-LD schemas and dynamic OpenGraph image previews for maximum social media impact.

## 🚀 Key Features

*   **Interactive AI Sandbox:** A terminal-style UI where potential clients can type their business niche and watch the agency's AI generate a 3-sentence professional marketing strategy in real-time.
*   **Neural Dashboard:** A mock administrative panel simulating deep-level digital control and infrastructure deployment.
*   **Performance First:** Built without heavy DOM libraries. Every scroll, hover, and click responds instantly.

## 💻 How to Run Locally

Because this project uses Netlify Serverless Functions for the AI Chatbot, you have two options for running the project on your local machine:

### Option 1: Full Environment (Recommended)
This runs both the frontend UI and the backend AI serverless functions. Use this if you want to test the AI Chatbot.

1. Install the Netlify CLI (if you haven't already):
   ```bash
   npm install netlify-cli -g
   ```
2. Run the development server:
   ```bash
   npx netlify dev
   ```
   *The site will open automatically (usually at `http://localhost:8888`). The AI Chatbot will be fully functional.*

### Option 2: Simple UI Environment
This runs the frontend UI only. Use this if you are just working on HTML/CSS and don't need the AI Chatbot to respond. 

You can use any simple web server, for example:
```bash
python -m http.server 8000
```
*Note: In this mode, the AI Chatbot will throw a `Network Error: Unexpected token '<'` because the backend Netlify functions are not running.*

## 📂 Project Structure

```text
├── netlify/functions/      # Serverless backend logic
├── styles.css              # Core design tokens and global layout
├── advanced-interactions.css # Micro-animations and hover effects
├── sandbox.js              # Logic bridging the frontend UI to the Gemini API
├── index.html              # The flagship landing experience
└── [other html routes]     # Services, Gallery, Contact, Admin
```

---
*Built for absolute digital dominance.*
