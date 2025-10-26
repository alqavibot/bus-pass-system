import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions"; // ✅

const firebaseConfig = {
  apiKey: "AIzaSyAYw3g9OEqZgVTsJ7K97hmXUAtSRRl5iGQ",
  authDomain: "bus-pass-system-a797e.firebaseapp.com",
  projectId: "bus-pass-system-a797e",
  storageBucket: "bus-pass-system-a797e.appspot.com",
  messagingSenderId: "831526176024",
  appId: "1:831526176024:web:4ed6f427c1e7fceaca0a6d",
  measurementId: "G-LHELK53T4H"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app); // ✅


