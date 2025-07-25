// js/firebase-notes.js
import { db } from "./firebase-config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function getUserNotes(uid) {
  const noteDoc = await getDoc(doc(db, "notes", uid));
  return noteDoc.exists() ? noteDoc.data().contenu : null;
}

export async function saveUserNotes(uid, content) {
  await setDoc(doc(db, "notes", uid), { contenu: content });
}
