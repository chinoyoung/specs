"use client";

import { useState } from "react";
import {
  FiBell,
  FiDownload,
  FiUser,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";

export default function DashboardHeader({ title, subtitle }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-800">{title}</h1>
        {subtitle && <p className="text-dark-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4 mt-4 md:mt-0">
        <button className="relative p-2 rounded-full text-dark-500 hover:bg-primary-50 hover:text-primary-600 focus:outline-none">
          <FiBell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-secondary-500 rounded-full"></span>
        </button>

        <div className="relative">
          <button
            className="flex items-center text-dark-500 hover:text-primary-600 focus:outline-none"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-2">
              <FiUser className="h-4 w-4" />
            </div>
            <span className="hidden md:block font-medium">Admin</span>
            <FiChevronDown className="ml-1 h-4 w-4" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-dark-100">
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
  );
}
