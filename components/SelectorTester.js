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
    <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Test Selectors</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      <p className="text-gray-600 mb-4">
        Test your CSS selectors before taking screenshots to ensure they match
        the expected elements.
      </p>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleTest}
          disabled={isLoading}
        >
          {isLoading ? "Testing..." : "Test Selectors"}
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Testing selectors..." />
      ) : results ? (
        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-900 mb-3">Results:</h3>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-md p-4 ${
                  result.exists && result.visibleCount > 0
                    ? "border-green-200 bg-green-50"
                    : "border-yellow-200 bg-yellow-50"
                }`}
              >
                <div className="flex flex-col md:flex-row md:justify-between mb-2">
                  <p className="font-mono text-sm break-all">
                    {result.selector}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      result.exists && result.visibleCount > 0
                        ? "text-green-700"
                        : "text-yellow-700"
                    }`}
                  >
                    {result.exists
                      ? `Found ${result.count} elements, ${result.visibleCount} visible`
                      : "No elements found"}
                  </p>
                </div>

                {result.exists &&
                  result.visibleCount > 0 &&
                  result.dimensions && (
                    <p className="text-xs text-gray-500">
                      First visible element size: {result.dimensions.width}px ×{" "}
                      {result.dimensions.height}px
                    </p>
                  )}

                {!result.exists && (
                  <p className="text-sm text-yellow-700 mt-1">
                    Selector not found on page. Check for typos or try a
                    different selector.
                  </p>
                )}

                {result.exists && result.visibleCount === 0 && (
                  <p className="text-sm text-yellow-700 mt-1">
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
