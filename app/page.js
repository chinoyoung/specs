"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardHeader from "../components/DashboardHeader";
import Protected from "../components/Protected";
import {
  FiCamera,
  FiLayers,
  FiImage,
  FiDownload,
  FiTrendingUp,
  FiCalendar,
  FiFile,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

export default function Home() {
  const [stats, setStats] = useState({
    totalScreenshots: 0,
    adComponents: 0,
    generalScreenshots: 0,
    lastCaptured: null,
  });

  // Simulate loading stats (in a real app, this would be an API call)
  useEffect(() => {
    // Mock data
    setStats({
      totalScreenshots: 142,
      adComponents: 98,
      generalScreenshots: 44,
      lastCaptured: new Date().toLocaleDateString(),
    });
  }, []);

  return (
    <Protected>
      <main>
        <DashboardHeader
          title="Dashboard"
          subtitle="Welcome to GoShotBroad, your advanced screenshot management tool"
        />

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-dark-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/ad-components"
            className="dashboard-card p-6 flex items-start"
          >
            <div className="rounded-full bg-primary-100 p-3 mr-4">
              <FiLayers className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-dark-800 mb-1">
                Capture Ad Components
              </h3>
              <p className="text-dark-500 text-sm">
                Take screenshots of advertising components organized by category
              </p>
            </div>
          </Link>

          <Link
            href="/general-screenshots"
            className="dashboard-card p-6 flex items-start"
          >
            <div className="rounded-full bg-secondary-100 p-3 mr-4">
              <FiImage className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <h3 className="font-medium text-dark-800 mb-1">
                General Screenshots
              </h3>
              <p className="text-dark-500 text-sm">
                Capture screenshots using custom CSS selectors
              </p>
            </div>
          </Link>

          <Link href="/about" className="dashboard-card p-6 flex items-start">
            <div className="rounded-full bg-dark-100 p-3 mr-4">
              <FiFile className="h-6 w-6 text-dark-600" />
            </div>
            <div>
              <h3 className="font-medium text-dark-800 mb-1">Documentation</h3>
              <p className="text-dark-500 text-sm">
                Learn more about using the screenshot tool
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Screenshots */}
        <h2 className="text-xl font-bold text-dark-800 mb-4">
          Recent Screenshots
        </h2>
        <div className="dashboard-card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">URL</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell font-medium">Screenshot {i}</td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          i % 2 === 0
                            ? "bg-primary-100 text-primary-800"
                            : "bg-secondary-100 text-secondary-800"
                        }`}
                      >
                        {i % 2 === 0 ? "Ad Component" : "General"}
                      </span>
                    </td>
                    <td className="table-cell text-dark-500 truncate max-w-xs">
                      https://example.com/page-{i}
                    </td>
                    <td className="table-cell text-dark-500">
                      {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 rounded-md text-primary-600 hover:bg-primary-50">
                          <FiDownload className="h-4 w-4" />
                        </button>
                        <button className="p-1 rounded-md text-dark-600 hover:bg-dark-50">
                          <FiImage className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </Protected>
  );
}
