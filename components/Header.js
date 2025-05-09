"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../utils/authContext";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-3 md:mb-0">
          Screenshot Tool
        </h1>
        <div className="flex items-center justify-between">
          <nav className="mr-6">
            <ul className="flex flex-wrap gap-4 md:gap-6">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/ad-components"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Ad Components
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-gray-900"
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>

          {user && (
            <div className="flex items-center">
              <div className="mr-4 hidden md:flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-2">
                  <FiUser className="h-4 w-4" />
                </div>
                <div className="text-sm text-gray-700">{user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FiLogOut className="h-5 w-5" />
                <span className="ml-1 hidden md:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
