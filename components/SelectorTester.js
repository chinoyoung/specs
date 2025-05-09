"use client";

import { useState } from "react";
import { testSelectors } from "../utils/api";
import LoadingSpinner from "./LoadingSpinner";

export default function SelectorTester({ url, selectors, onClose }) {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTest = async () => {
    if (!url || !selectors || Object.keys(selectors).length === 0) {
      setError("URL and selectors are required");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const selectorList = Object.values(selectors).filter(Boolean);
      const data = await testSelectors({
        url,
        selectors: selectorList,
        viewport: { width: 1280, height: 800 },
        waitTime: 1000,
      });

      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error("Error testing selectors:", error);
      setError(error.message || "Failed to test selectors");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-card p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-dark-800">Test Selectors</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-500 transition-colors p-1 rounded-full hover:bg-dark-100"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      <p className="text-dark-600 mb-4">
        Test your CSS selectors before taking screenshots to ensure they match
        the expected elements.
      </p>

      {error && (
        <div className="bg-secondary-50 border-l-4 border-secondary-500 p-4 mb-4 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-secondary-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-secondary-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          className="btn btn-primary flex items-center gap-2"
          onClick={handleTest}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Testing...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Test Selectors
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Testing selectors..." />
      ) : results ? (
        <div className="mt-4">
          <h3 className="text-md font-medium text-dark-800 mb-3">Results:</h3>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-md p-4 ${
                  result.exists && result.visibleCount > 0
                    ? "border-green-200 bg-green-50"
                    : "border-secondary-200 bg-secondary-50"
                }`}
              >
                <div className="flex flex-col md:flex-row md:justify-between mb-2">
                  <p className="font-mono text-sm break-all text-dark-700">
                    {result.selector}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      result.exists && result.visibleCount > 0
                        ? "text-green-700"
                        : "text-secondary-700"
                    } flex items-center`}
                  >
                    {result.exists && result.visibleCount > 0 ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Found {result.count} elements, {result.visibleCount}{" "}
                        visible
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        No elements found
                      </>
                    )}
                  </p>
                </div>

                {result.exists &&
                  result.visibleCount > 0 &&
                  result.dimensions && (
                    <p className="text-xs text-dark-500 bg-dark-50 p-2 rounded-md mt-2">
                      <span className="font-medium">
                        First visible element size:
                      </span>{" "}
                      {result.dimensions.width}px × {result.dimensions.height}px
                    </p>
                  )}

                {!result.exists && (
                  <p className="text-sm text-secondary-700 mt-2 bg-secondary-50 p-2 rounded-md">
                    Selector not found on page. Check for typos or try a
                    different selector.
                  </p>
                )}

                {result.exists && result.visibleCount === 0 && (
                  <p className="text-sm text-secondary-700 mt-2 bg-secondary-50 p-2 rounded-md flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                    Elements found but none are visible. They might be hidden or
                    have zero dimensions.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
