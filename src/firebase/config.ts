import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyDOIzhU1VU8l87xZRBfgwJo2g5Zwo1aN00",
  authDomain: "cashflow-crm.firebaseapp.com",
  projectId: "cashflow-crm",
  storageBucket: "cashflow-crm.firebasestorage.app",
  messagingSenderId: "495918318019",
  appId: "1:495918318019:web:8dd02063293591f9d0bd76"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспорт сервисов
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

