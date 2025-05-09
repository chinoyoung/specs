"use client";

/**
 * Utility to check if Firebase is properly configured
 * Helps detect missing or incorrect environment variables
 */
export const checkFirebaseConfig = () => {
  const requiredEnvVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName] || process.env[varName] === "undefined"
  );

  if (missingVars.length > 0) {
    console.error(`Missing Firebase configuration: ${missingVars.join(", ")}`);
    return {
      isConfigured: false,
      missingVars,
      message: `Firebase is not properly configured. Missing: ${missingVars.join(
        ", "
      )}`,
    };
  }

  return { isConfigured: true };
};

/**
 * Utility to check if the current environment is development or production
 */
export const getEnvironment = () => {
  return process.env.NODE_ENV || "development";
};

export default { checkFirebaseConfig, getEnvironment };
