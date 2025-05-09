"use client";

import Header from "../../components/Header";

export default function About() {
  return (
    <main>
      <Header />

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          About the Screenshot Tool
        </h1>

        <div className="prose max-w-none">
          <p>
            The Screenshot Tool is a specialized application for capturing and
            documenting UI elements from websites. It uses the power of CSS
            selectors to target and capture specific components, making it ideal
            for documenting design specifications, UI patterns, and advertising
            components.
          </p>

          <h2>Features</h2>
          <ul>
            <li>
              Capture screenshots of specific UI elements using CSS selectors
            </li>
            <li>
              Dedicated tool for ad component screenshots organized by category
            </li>
            <li>Custom viewport sizing to test responsive designs</li>
            <li>Save and load configurations for repeated use</li>
            <li>Batch processing for capturing multiple elements</li>
            <li>
              Download individual screenshots or bulk download as a zip file
            </li>
          </ul>

          <h2>Technical Details</h2>
          <p>
            This tool is built using Next.js and Tailwind CSS for the frontend,
            with a Node.js backend that uses Puppeteer for browser automation
            and screenshot capturing. The backend handles the rendering of web
            pages, locating elements via CSS selectors, and capturing
            screenshots of those elements.
          </p>

          <h2>Usage Tips</h2>
          <ul>
            <li>Use specific CSS selectors for more accurate targeting</li>
            <li>Increase the wait time for pages with dynamic content</li>
            <li>
              Test selectors first if you're unsure about the correct selector
            </li>
            <li>
              For ad components, use the specialized Ad Components tool which
              organizes results by category
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
