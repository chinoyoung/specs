"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiUser, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useAuth } from "../../utils/authContext";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const router = useRouter();
  const { signup, loginWithGoogle, error, isFirebaseConfigured } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Check if passwords match
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    // Check password length
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    // Check email domain
    if (!email.endsWith("@goabroad.com")) {
      setValidationError("Only @goabroad.com email addresses are allowed");
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(email, password);
      if (success) {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setValidationError("");

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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-dark-500">
            Sign up for GoShotBroad with your @goabroad.com email
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-dark-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-dark-300 placeholder-dark-400 text-dark-800 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Email address (@goabroad.com)"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-dark-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-dark-300 placeholder-dark-400 text-dark-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Password (minimum 6 characters)"
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-dark-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-dark-300 placeholder-dark-400 text-dark-800 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          {(validationError || error) && (
            <div className="flex items-center text-secondary-600 bg-secondary-50 p-3 rounded-md">
              <FiAlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">{validationError || error}</span>
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
              type="submit"
              disabled={isLoading || !isFirebaseConfigured}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-dark-500">
                Or sign up with
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || !isFirebaseConfigured}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-dark-300 rounded-md shadow-sm bg-white text-sm font-medium text-dark-700 hover:bg-dark-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
            >
              <FcGoogle className="h-5 w-5" />
              {isGoogleLoading ? "Signing up..." : "Sign up with Google"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-dark-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </p>
            {error && error.includes("Firebase") && (
              <p className="text-xs text-dark-400 mt-2">
                Note: If you're experiencing Firebase configuration issues, make
                sure your .env.local file is properly set up.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
