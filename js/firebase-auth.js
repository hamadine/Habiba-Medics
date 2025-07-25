// js/firebase-auth.js
import { auth, signInAnonymously } from "./firebase-config.js";

export async function signInAnon() {
  try {
    const result = await signInAnonymously(auth);
    return result.user.uid;
  } catch (error) {
    console.error("❌ Auth anonyme Firebase échouée :", error);
    throw error;
  }
}
