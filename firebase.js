import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database'; // Se fores usar o Realtime Database
import { getFirestore } from 'firebase/firestore'; // Se fores usar o Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBq22BlwDCEO7fDqbEmFMbXznKqQF2BV14",
  authDomain: "carla-v5.firebaseapp.com",
  databaseURL: "https://carla-v5-default-rtdb.firebaseio.com",
  projectId: "carla-v5",
  storageBucket: "carla-v5.firebasestorage.app",
  messagingSenderId: "118871134461",
  appId: "1:118871134461:web:d591802639fdf38b7aae94",
  measurementId: "G-DCJ2HHQCPE"
};

// Inicializa a aplicação
const app = initializeApp(firebaseConfig);

// Inicializa o Realtime Database (se estiveres a usar este)
const db = getDatabase(app);

// Se fores usar o Firestore em vez do Realtime Database, descomenta a linha abaixo:
// const db = getFirestore(app);

export { app, db };
