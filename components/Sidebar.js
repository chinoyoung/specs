"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiHome,
  FiImage,
  FiLayers,
  FiInfo,
  FiMenu,
  FiX,
  FiSettings,
  FiDownload,
  FiLogOut,
  FiUser,
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
        className={`fixed inset-y-0 left-0 z-40 bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:w-${isSidebarCollapsed ? "20" : "64"}`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-dark-100">
            <Link href="/" className="flex items-center">
              {!isSidebarCollapsed && (
                <span className="text-xl font-bold text-primary-700">
                  GoShotBroad
                </span>
              )}
              {isSidebarCollapsed && (
                <span className="text-xl font-bold text-primary-700">SP</span>
              )}
            </Link>

            <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:block p-2 rounded-md text-dark-400 hover:bg-primary-50"
            >
              {isSidebarCollapsed ? (
                <FiMenu className="h-5 w-5" />
              ) : (
                <FiMenu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-md transition-colors duration-200 ${
                      isActive(item.href)
                        ? "bg-primary-50 text-primary-700"
                        : "text-dark-600 hover:bg-primary-50 hover:text-primary-700"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        isActive(item.href)
                          ? "text-primary-700"
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
          <div className="p-4 border-t border-dark-100">
            {user && (
              <div className="mb-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-2">
                  <FiUser className="h-4 w-4" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="overflow-hidden">
                    <div className="text-sm font-medium text-dark-800 truncate">
                      {user.email}
                    </div>
                    <div className="text-xs text-dark-500">
                      GoAbroad Employee
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col space-y-2">
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center p-2 text-dark-600 hover:bg-primary-50 hover:text-primary-700 rounded-md"
                >
                  <FiLogOut className="h-5 w-5" />
                  {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
                </button>
              )}

              <div className="flex items-center p-2">
                <FiSettings className="h-5 w-5 text-dark-500" />
                {!isSidebarCollapsed && (
                  <span className="ml-3 text-dark-600">© 2025 GoShotBroad</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
