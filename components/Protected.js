"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../utils/authContext";
import LoadingSpinner from "./LoadingSpinner";

export default function Protected({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return children;
}
