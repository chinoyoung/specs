// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { checkFirebaseConfig } from "./configHelper";

// Check Firebase configuration
const configStatus = checkFirebaseConfig();
if (!configStatus.isConfigured) {
  console.warn("Firebase configuration issue:", configStatus.message);
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase - with error handling
let app;
let auth;
let googleProvider;
let db;

try {
  // Check if required Firebase config values are present
  const requiredConfigs = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];

  const missingConfigs = requiredConfigs.filter((key) => !firebaseConfig[key]);

  if (missingConfigs.length > 0) {
    throw new Error(
      `Missing required Firebase config: ${missingConfigs.join(
        ", "
      )}. Please check your .env.local file.`
    );
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();

  // Configure Google Auth Provider
  googleProvider.setCustomParameters({
    // Force account selection even when only one account is available
    prompt: "select_account",
    // Restrict to @goabroad.com domain - note this is just a hint, we still need to validate in code
    hd: "goabroad.com",
  });

  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error.message);
  // Create placeholder objects to prevent app from crashing
  app = {};
  auth = {
    currentUser: null,
    onAuthStateChanged: () => {},
    signInWithEmailAndPassword: () =>
      Promise.reject(new Error("Firebase not initialized")),
    createUserWithEmailAndPassword: () =>
      Promise.reject(new Error("Firebase not initialized")),
    signOut: () => Promise.reject(new Error("Firebase not initialized")),
  };
  googleProvider = {};
  db = {};
}

export { auth, googleProvider, db };
export default app;
