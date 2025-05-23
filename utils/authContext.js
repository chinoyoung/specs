"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true);

  // Check if Firebase is properly configured
  useEffect(() => {
    try {
      // If auth doesn't have the expected methods, it means Firebase isn't properly configured
      if (!auth.currentUser && typeof auth.onAuthStateChanged !== "function") {
        setIsFirebaseConfigured(false);
        setError(
          "Firebase is not properly configured. Please check your environment variables."
        );
        setLoading(false);
      }
    } catch (err) {
      setIsFirebaseConfigured(false);
      setError("Firebase initialization error: " + err.message);
      setLoading(false);
    }
  }, []);

  // Check if email is from goabroad.com domain
  const isGoAbroadEmail = (email) => {
    return email.endsWith("@goabroad.com");
  };

  // Register with email and password
  const signup = async (email, password) => {
    setError("");

    if (!isFirebaseConfigured) {
      setError(
        "Firebase is not properly configured. Please check your environment variables."
      );
      return false;
    }

    if (!isGoAbroadEmail(email)) {
      setError("Only @goabroad.com email addresses are allowed");
      return false;
    }

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    setError("");

    if (!isFirebaseConfigured) {
      setError(
        "Firebase is not properly configured. Please check your environment variables."
      );
      return false;
    }

    if (!isGoAbroadEmail(email)) {
      setError("Only @goabroad.com email addresses are allowed");
      return false;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    setError("");

    if (!isFirebaseConfigured) {
      setError(
        "Firebase is not properly configured. Please check your environment variables."
      );
      return false;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;

      // Verify that the email is from goabroad.com domain
      if (!isGoAbroadEmail(user.email)) {
        // Sign out the user if email is not from goabroad.com
        await signOut(auth);
        setError("Only @goabroad.com email addresses are allowed");
        return false;
      }

      return true;
    } catch (err) {
      // Authentication errors
      setError(err.message);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    setError("");
    try {
      await signOut(auth);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Handle cookie setting for auth token
  const setCookieForAuth = async (user) => {
    if (user) {
      const token = await user.getIdToken();
      // Set cookie (will be handled by middleware)
      document.cookie = `auth=${token}; path=/; max-age=3600; SameSite=Strict`;
    } else {
      // Remove the cookie when user is null (logged out)
      document.cookie = "auth=; path=/; max-age=0; SameSite=Strict";
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // Skip the auth state listener if Firebase is not configured
    if (!isFirebaseConfigured) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await setCookieForAuth(user);
      } else {
        setUser(null);
        setCookieForAuth(null);
      }
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, [isFirebaseConfigured]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isFirebaseConfigured,
        signup,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
