import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCJqm6K8qLkU-iMO9557-KbCjpTQR_7k04",
  authDomain: "qtradex-binary.firebaseapp.com",
  projectId: "qtradex-binary",
  storageBucket: "qtradex-binary.firebasestorage.app",
  messagingSenderId: "803071522784",
  appId: "1:803071522784:web:d4accf3337661a87be9d85"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
