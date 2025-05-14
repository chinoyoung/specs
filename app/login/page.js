"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../utils/authContext";

export default function Login() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { loginWithGoogle, error, isFirebaseConfigured } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      const success = await loginWithGoogle();
      if (success) {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-800">
            Sign in to GoShotBroad
          </h2>
          <p className="mt-2 text-center text-sm text-dark-500">
            Your advanced screenshot management tool
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {error && (
            <div className="flex items-center text-secondary-600 bg-secondary-50 p-3 rounded-md">
              <FiAlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {!isFirebaseConfigured && (
            <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-md">
              <FiAlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">
                Firebase is not properly configured. Please check your
                environment variables in .env.local file.
              </span>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || !isFirebaseConfigured}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-dark-300 rounded-md shadow-sm bg-white text-sm font-medium text-dark-700 hover:bg-dark-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
            >
              <FcGoogle className="h-5 w-5" />
              {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-dark-500">
              Only @goabroad.com email addresses are allowed
            </p>
            {error && error.includes("Firebase") && (
              <p className="text-xs text-dark-400 mt-2">
                Note: If you're experiencing Firebase configuration issues, make
                sure your .env.local file is properly set up.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
