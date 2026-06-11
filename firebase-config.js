// firebase-config.js
// Firebase v12.14.0 Modular SDK Configuration — Kirmada.Online

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";

// Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBg5cLhwE4kp7Xp_pkYAIGcBMfkmhr5OyY",
  authDomain: "kirmadaonline-c58da.firebaseapp.com",
  projectId: "kirmadaonline-c58da",
  storageBucket: "kirmadaonline-c58da.firebasestorage.app",
  messagingSenderId: "555808711455",
  appId: "1:555808711455:web:2ddab200c13f6c1985862a",
  measurementId: "G-2NP6FVEQ2L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services so other files can import them
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics may fail on localhost or with ad-blockers — wrap safely
let analyticsInstance = null;
try {
  analyticsInstance = getAnalytics(app);
} catch (e) {
  console.warn('Firebase Analytics could not be initialized:', e.message);
}
export const analytics = analyticsInstance;

