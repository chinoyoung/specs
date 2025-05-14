"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "../components/PageHeader";
import Protected from "../components/Protected";
import { useAuth } from "../utils/authContext";
import * as configStore from "../utils/configurationStore";
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
  FiSettings,
  FiStar,
  FiTrash2,
} from "react-icons/fi";

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalScreenshots: 0,
    adComponents: 0,
    generalScreenshots: 0,
    lastCaptured: null,
  });
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Load user's saved configurations
  useEffect(() => {
    if (user) {
      loadUserConfigs();
    }
  }, [user]);

  const loadUserConfigs = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const configs = await configStore.getUserConfigurations(user.uid);
      setSavedConfigs(configs);
    } catch (error) {
      console.error("Error loading configurations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefaultConfig = async (configId) => {
    if (!user) return;

    try {
      setIsLoading(true);
      await configStore.setDefaultConfiguration(configId, user.uid);
      await loadUserConfigs();
    } catch (error) {
      console.error("Error setting default configuration:", error);
      alert(`Error setting default configuration: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfig = async (configId) => {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this configuration?")) {
      return;
    }

    try {
      setIsLoading(true);
      await configStore.deleteConfiguration(configId);
      await loadUserConfigs();
    } catch (error) {
      console.error("Error deleting configuration:", error);
      alert(`Error deleting configuration: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Protected>
      <PageHeader
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

      {/* Saved Configuration Presets */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark-800">
            Saved Configuration Presets
          </h2>
          <Link
            href="/general-screenshots"
            className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1"
          >
            <FiSettings size={15} />
            <span>Manage Configurations</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="dashboard-card p-6 flex justify-center items-center min-h-[200px]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-dark-100 rounded-full mb-4"></div>
              <div className="h-4 w-40 bg-dark-100 rounded mb-3"></div>
              <div className="h-3 w-32 bg-dark-100 rounded"></div>
            </div>
          </div>
        ) : savedConfigs.length === 0 ? (
          <div className="dashboard-card p-8 text-center">
            <div className="bg-dark-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <FiSettings className="h-8 w-8 text-dark-400" />
            </div>
            <h3 className="text-lg font-medium text-dark-800 mb-2">
              No saved configurations
            </h3>
            <p className="text-dark-500 mb-4">
              Save your screenshot configurations to reuse them and share with
              your team.
            </p>
            <Link
              href="/general-screenshots"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <FiSettings size={16} />
              <span>Create Configuration</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedConfigs.map((config) => (
              <div
                key={config.id}
                className="dashboard-card overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-md mr-3 ${
                          config.isDefault ? "bg-primary-100" : "bg-dark-100"
                        }`}
                      >
                        <FiSettings
                          className={`h-5 w-5 ${
                            config.isDefault
                              ? "text-primary-600"
                              : "text-dark-500"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-dark-800">
                          {config.name}
                        </h3>
                        <p className="text-xs text-dark-500">
                          {config.updatedAt
                            ? `Updated ${new Date(
                                config.updatedAt
                              ).toLocaleDateString()}`
                            : `Created ${new Date(
                                config.createdAt
                              ).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    {config.isDefault && (
                      <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-dark-600 mb-4 line-clamp-2">
                    {config.description || "No description provided"}
                  </p>

                  <div className="text-xs text-dark-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Mode:</span>
                      <span className="font-medium text-dark-700">
                        {config.config.activeTab === "single"
                          ? "Single URL"
                          : "Batch Mode"}
                      </span>
                    </div>
                    {config.config.activeTab === "single" && (
                      <>
                        <div className="flex justify-between">
                          <span>URL:</span>
                          <span
                            className="font-medium text-dark-700 truncate max-w-[180px]"
                            title={config.config.url}
                          >
                            {config.config.url || "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Selectors:</span>
                          <span className="font-medium text-dark-700">
                            {
                              Object.values(
                                config.config.selectors || {}
                              ).filter(Boolean).length
                            }
                          </span>
                        </div>
                      </>
                    )}
                    {config.config.activeTab === "batch" && (
                      <>
                        <div className="flex justify-between">
                          <span>URLs:</span>
                          <span className="font-medium text-dark-700">
                            {(config.config.urls || []).filter(Boolean).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Selectors:</span>
                          <span className="font-medium text-dark-700">
                            {
                              (config.config.batchSelectors || []).filter(
                                Boolean
                              ).length
                            }
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span>Viewport:</span>
                      <span className="font-medium text-dark-700">
                        {config.config.viewportWidth}×
                        {config.config.viewportHeight}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dark-100 p-4 bg-dark-50 flex justify-between">
                  <Link
                    href={`/general-screenshots?config=${config.id}`}
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                  >
                    <FiImage size={15} />
                    <span>Use Configuration</span>
                  </Link>

                  <div className="flex items-center space-x-2">
                    {!config.isDefault && (
                      <button
                        onClick={() => handleSetDefaultConfig(config.id)}
                        className="text-sm text-dark-500 hover:text-primary-600 flex items-center gap-1"
                        title="Set as default"
                      >
                        <FiStar size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteConfig(config.id)}
                      className="text-sm text-dark-500 hover:text-secondary-600 flex items-center gap-1"
                      title="Delete configuration"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
    </Protected>
  );
}
