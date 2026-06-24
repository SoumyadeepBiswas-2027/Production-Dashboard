import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

// ─── Sign up with email + password  (creates new account, returns the user object)
export const signUpWithEmail = async (email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user; // contains uid, email etc
};

// ─── Login with email + password (logs in existing user)
export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

// ─── Login with Google(popup) => (opens Google popup, logs in/signs up automatically)
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// ─── Logout  (signs out current user)
export const logout = async () => {
  await signOut(auth);
};