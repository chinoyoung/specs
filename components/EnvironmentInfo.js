"use client";

import { useState } from "react";
import { FiInfo, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { getEnvironment, checkFirebaseConfig } from "../utils/configHelper";

/**
 * A component that displays environment information in development mode
 * Helps with debugging configuration issues
 */
export default function EnvironmentInfo() {
  const [isExpanded, setIsExpanded] = useState(false);
  const environment = getEnvironment();
  const firebaseConfig = checkFirebaseConfig();

  // Only show in development
  if (environment !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-w-md">
        <div
          className={`flex items-center justify-between p-3 cursor-pointer ${
            !firebaseConfig.isConfigured ? "bg-red-100" : "bg-gray-50"
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            <FiInfo
              className={`mr-2 ${
                !firebaseConfig.isConfigured
                  ? "text-red-500"
                  : "text-primary-500"
              }`}
            />
            <span className="text-sm font-medium">
              {!firebaseConfig.isConfigured
                ? "Firebase Configuration Error"
                : "Environment Info"}
            </span>
          </div>
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {isExpanded && (
          <div className="p-4 text-xs space-y-2">
            <div>
              <span className="font-semibold">Environment:</span> {environment}
            </div>

            <div>
              <span className="font-semibold">Firebase Configuration:</span>
              {firebaseConfig.isConfigured ? (
                <span className="text-green-600 ml-1">OK</span>
              ) : (
                <div className="text-red-500 mt-1">
                  {firebaseConfig.message}
                </div>
              )}
            </div>

            <div className="text-gray-500 mt-4 text-xs">
              <p>This debug panel is only visible in development mode.</p>
              <p>To hide it, set NODE_ENV to production.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
