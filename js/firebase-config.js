// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBalIy0kTC0a_ZjxNMmn1ZUfznO3kZYk6w",
  authDomain: "habibamedics.firebaseapp.com",
  projectId: "habibamedics",
  storageBucket: "habibamedics.appspot.com",
  messagingSenderId: "727036841121",
  appId: "1:727036841121:web:50dc1a0099b1119858f4e0",
  measurementId: "G-LH90ZZ1C8M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, signInAnonymously };
