"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../utils/authContext";
import LoadingSpinner from "./LoadingSpinner";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

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

  return (
    <div className="flex h-screen overflow-hidden bg-dark-50">
      <Sidebar />
      <div className="flex flex-col flex-1 md:ml-64 min-h-screen">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto pt-20 px-4 md:px-6 pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
