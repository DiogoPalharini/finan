// src/config/firebaseConfig.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBPWntEgVA4fze0ZDHnSqjPIIcA5nLU1Ck",
  authDomain: "finanapp-35a41.firebaseapp.com",
  databaseURL: "https://finanapp-35a41-default-rtdb.firebaseio.com",
  projectId: "finanapp-35a41",
  storageBucket: "finanapp-35a41.firebasestorage.app",
  messagingSenderId: "128316694218",
  appId: "1:128316694218:web:d38397d753967f13621e33"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
