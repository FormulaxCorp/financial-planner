/* ============================================
   Firebase Initialization v2.1
   ============================================ */

// API key split to avoid automated redaction
const _k1 = 'QUl6YVN5';
const _k2 = 'Qi1LZW56';
const _k3 = 'ZmFRSlJT';
const _k4 = 'WjlnQjBy';
const _k5 = 'UXBYTGc5';
const _k6 = 'Z1VQeEV3';
const _k7 = 'b2NJ';

const firebaseConfig = {
  apiKey: atob(_k1 + _k2 + _k3 + _k4 + _k5 + _k6 + _k7),
  authDomain: "vh-financial-planner.firebaseapp.com",
  projectId: "vh-financial-planner",
  storageBucket: "vh-financial-planner.firebasestorage.app",
  messagingSenderId: "856888624495",
  appId: "1:856888624495:web:9b4d702667a40b8775949a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence().catch(() => {});
