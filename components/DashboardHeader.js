"use client";

import { useState } from "react";
import { FiUser, FiSettings, FiChevronDown, FiCamera } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../utils/authContext";
import {
  getProfileImageUrl,
  profileImageLoader,
  updateProfileImage,
} from "../utils/profileImage";

export default function DashboardHeader() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user } = useAuth();

  const handleProfileImageClick = (e) => {
    e.stopPropagation(); // Prevent dropdown from opening
    if (user) {
      updateProfileImage(user, () => {
        // Force a refresh of gravatar image by adding a timestamp (would normally reload from Firebase)
        const timestamp = new Date().getTime();
        console.log(`Profile image update initiated at ${timestamp}`);
      });
    }
  };

  // Extract name from email: "john.doe@goabroad.com" -> "John Doe"
  const getUserName = (email) => {
    if (!email) return "User";
    const namePart = email.split("@")[0];
    return namePart
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 right-0 left-0 z-30 md:left-64 h-16">
      <div className="flex items-center justify-end h-full px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="flex items-center text-dark-500 hover:text-primary-600 focus:outline-none"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 relative group">
                {user ? (
                  <>
                    <Image
                      src={getProfileImageUrl(user, 32)}
                      alt={getUserName(user.email)}
                      width={32}
                      height={32}
                      loader={profileImageLoader}
                      className="h-full w-full object-cover"
                    />
                    <div
                      onClick={handleProfileImageClick}
                      className="absolute inset-0 bg-dark-800 bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <FiCamera className="text-white h-4 w-4" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-700">
                    <FiUser className="h-4 w-4" />
                  </div>
                )}
              </div>
              <span className="hidden md:block font-medium">
                {user ? getUserName(user.email) : "Guest"}
              </span>
              <FiChevronDown className="ml-1 h-4 w-4" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 max-w-sm bg-white rounded-md shadow-lg py-1 z-10 border border-dark-100">
                <div className="px-4 py-2 text-sm font-medium text-dark-800 border-b border-dark-100 truncate">
                  {user ? user.email : "Not logged in"}
                </div>
                <button
                  onClick={handleProfileImageClick}
                  className="block w-full text-left px-4 py-2 text-sm text-dark-700 hover:bg-primary-50"
                >
                  Change Profile Picture
                </button>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-dark-700 hover:bg-primary-50"
                >
                  Your Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-dark-700 hover:bg-primary-50"
                >
                  Settings
                </a>
                <div className="border-t border-dark-100 my-1"></div>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-dark-700 hover:bg-primary-50"
                >
                  Sign out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
