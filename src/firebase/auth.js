// src/firebase/auth.js
import { auth, db } from "./config";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Register new student
export const registerUser = async (email, password, userData) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const user = res.user;

  // Save user profile in Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    role: "student", // default role
    ...userData, // name, hallticket, etc.
  });

  return user;
};

// Login existing user
export const loginUser = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

// Logout
export const logoutUser = async () => {
  await signOut(auth);
};

// Get user profile
export const getUserProfile = async (uid) => {
  const docRef = doc(db, "users", uid);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() : null;
};
