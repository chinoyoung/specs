"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FiHome,
  FiImage,
  FiLayers,
  FiInfo,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../utils/authContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/", icon: FiHome },
    { name: "Ad Components", href: "/ad-components", icon: FiLayers },
    {
      name: "General Screenshots",
      href: "/general-screenshots",
      icon: FiImage,
    },
    { name: "About", href: "/about", icon: FiInfo },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isActive = (path) => {
    return pathname === path;
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
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-dark-600 hover:bg-primary-100 focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-dark-900 bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-slate-900 shadow-lg transform transition-transform duration-300 ease-in-out 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:w-64`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-center px-4 h-16 border-b border-slate-800">
            <Link href="/" className="flex items-center">
              {!isSidebarCollapsed && (
                <div className="flex items-center">
                  <Image
                    src="/logo.png"
                    alt="GoShotBroad Logo"
                    width={96}
                    height={32}
                    className="h-8 w-auto"
                  />
                </div>
              )}
              {isSidebarCollapsed && (
                <Image
                  src="/logo.png"
                  alt="GoShotBroad Logo"
                  width={96}
                  height={32}
                  className="h-8 w-auto"
                />
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 font-bold text-xs rounded-md transition-colors duration-200 ${
                      isActive(item.href)
                        ? "bg-slate-700 text-slate-100"
                        : "text-dark-600 hover:bg-slate-700 hover:text-slate-100"
                    }`}
                  >
                    <item.icon
                      className={`h-4 w-4 ${
                        isActive(item.href)
                          ? "text-slate-400"
                          : "text-dark-500"
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex flex-col space-y-2">
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center p-2 text-dark-600 hover:bg-red-400 hover:text-slate-100 rounded-md"
                >
                  <FiLogOut className="h-4 w-4" />
                  {!isSidebarCollapsed && (
                    <span className="ml-3 font-bold text-xs">Logout</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
