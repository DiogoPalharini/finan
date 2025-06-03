import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Export Firebase services
export { auth };
export const db = getFirestore(app); // Firestore (optional)
export const rtdb = getDatabase(app); // Realtime Database