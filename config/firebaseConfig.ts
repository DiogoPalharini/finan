import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBPWntEgVA4fze0ZDHnSqjPIIcA5nLU1Ck",
  authDomain: "finanapp-35a41.firebaseapp.com",
  databaseURL: "https://finanapp-35a41-default-rtdb.firebaseio.com",
  projectId: "finanapp-35a41",
  storageBucket: "finanapp-35a41.appspot.com",
  messagingSenderId: "128316694218",
  appId: "1:128316694218:web:d38397d753967f13621e33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized:", app.name); // Debug log to confirm initialization

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); // Firestore (optional)
export const rtdb = getDatabase(app); // Realtime Database
export const storage = getStorage(app); // Firebase Storage