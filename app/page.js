"use client";

import { useState } from "react";
import Header from "../components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Header />

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to the Screenshot Tool
        </h1>
        <p className="text-gray-600 mb-8">
          A modern tool for capturing and documenting UI elements from websites
          using CSS selectors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Ad Components
            </h2>
            <p className="text-gray-600 mb-4">
              Take screenshots of advertising components organized by categories
              defined in specifications.
            </p>
            <Link
              href="/ad-components"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              Go to Ad Components
              <svg
                className="ml-1 w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              General Screenshots
            </h2>
            <p className="text-gray-600 mb-4">
              Capture screenshots of any elements on websites using custom CSS
              selectors. Supports batch processing of multiple URLs.
            </p>
            <Link
              href="/general-screenshots"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              Go to General Screenshots
              <svg
                className="ml-1 w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mt-8 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Getting Started
          </h2>

          <ol className="list-decimal ml-5 space-y-3 text-gray-600">
            <li>
              <strong>Choose a Tool:</strong> Select either Ad Components for
              specialized ad screenshots, or General Screenshots for any website
              elements.
            </li>
            <li>
              <strong>Enter URL:</strong> Provide the URL of the website you
              want to capture.
            </li>
            <li>
              <strong>Specify Selectors:</strong> Enter CSS selectors to target
              specific elements on the page.
            </li>
            <li>
              <strong>Configure Options:</strong> Adjust viewport dimensions and
              wait time as needed.
            </li>
            <li>
              <strong>Capture Screenshots:</strong> Click the capture button and
              view your screenshots!
            </li>
          </ol>
        </div>

        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-blue-800 mb-2">Pro Tip</h3>
          <p className="text-blue-700 text-sm">
            Use the selector testing feature to verify your CSS selectors before
            taking screenshots. This helps ensure you're capturing the right
            elements.
          </p>
        </div>
      </div>
    </main>
  );
}
