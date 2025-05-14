"use client";

import Protected from "../../components/Protected";
import PageHeader from "../../components/PageHeader";
import { FiFileText, FiShield, FiInfo } from "react-icons/fi";
import { BsCheckSquareFill } from "react-icons/bs";

export default function About() {
  return (
    <Protected>
      <PageHeader
        title="About GoShotBroad"
        subtitle="Learn more about the tool and its features"
      />

      <div className="container mx-auto px-4">
        <div className="dashboard-card p-8 mb-8 shadow-lg rounded-lg">
          <div className="prose max-w-none text-dark-700">
            <p className="text-lg leading-relaxed mb-6">
              The Screenshot Tool is a specialized application for capturing and
              documenting UI elements from websites. It uses the power of CSS
              selectors to target and capture specific components, making it
              ideal for documenting design specifications, UI patterns, and
              advertising components.
            </p>

            <h2 className="flex items-center gap-2 text-primary-600 text-xl mt-8 mb-4">
              <FiFileText size={24} />
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <ul className="space-y-3">
                <li className="flex items-start bg-light-50 p-3 rounded-lg hover:bg-light-100 transition-colors">
                  <BsCheckSquareFill
                    className="text-primary-500 mt-1 mr-3 flex-shrink-0"
                    size={18}
                  />
                  <span>
                    Capture screenshots of specific UI elements using CSS
                    selectors
                  </span>
                </li>
                <li className="flex items-start bg-light-50 p-3 rounded-lg hover:bg-light-100 transition-colors">
                  <BsCheckSquareFill
                    className="text-primary-500 mt-1 mr-3 flex-shrink-0"
                    size={18}
                  />
                  <span>
                    Dedicated tool for ad component screenshots organized by
                    category
                  </span>
                </li>
                <li className="flex items-start bg-light-50 p-3 rounded-lg hover:bg-light-100 transition-colors">
                  <BsCheckSquareFill
                    className="text-primary-500 mt-1 mr-3 flex-shrink-0"
                    size={18}
                  />
                  <span>Custom viewport sizing to test responsive designs</span>
                </li>
                <li className="flex items-start bg-light-50 p-3 rounded-lg hover:bg-light-100 transition-colors">
                  <BsCheckSquareFill
                    className="text-primary-500 mt-1 mr-3 flex-shrink-0"
                    size={18}
                  />
                  <span>Save and load configurations for repeated use</span>
                </li>
                <li className="flex items-start bg-light-50 p-3 rounded-lg hover:bg-light-100 transition-colors">
                  <BsCheckSquareFill
                    className="text-primary-500 mt-1 mr-3 flex-shrink-0"
                    size={18}
                  />
                  <span>Batch processing for capturing multiple elements</span>
                </li>
              </ul>

              <ul className="space-y-3">
                <li className="flex items-start bg-light-50 p-3 rounded-lg hover:bg-light-100 transition-colors">
                  <BsCheckSquareFill
                    className="text-primary-500 mt-1 mr-3 flex-shrink-0"
                    size={18}
                  />
                  <span>
                    Download individual screenshots or bulk download as a zip
                    file
                  </span>
                </li>
                <li className="flex items-start bg-light-50 p-3 rounded-lg hover:bg-light-100 transition-colors">
                  <BsCheckSquareFill
                    className="text-primary-500 mt-1 mr-3 flex-shrink-0"
                    size={18}
                  />
                  <span>
                    Generate detailed PDF reports with image analysis
                    information
                  </span>
                </li>
                <li className="flex items-start bg-light-50 p-3 rounded-lg hover:bg-light-100 transition-colors">
                  <BsCheckSquareFill
                    className="text-primary-500 mt-1 mr-3 flex-shrink-0"
                    size={18}
                  />
                  <span>
                    Automatically detect stretched images and display warnings
                  </span>
                </li>
                <li className="flex items-start bg-light-50 p-3 rounded-lg hover:bg-light-100 transition-colors">
                  <BsCheckSquareFill
                    className="text-primary-500 mt-1 mr-3 flex-shrink-0"
                    size={18}
                  />
                  <span>Configure different URLs for each ad category</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-primary-50 p-6 rounded-lg border border-primary-100">
                <h2 className="flex items-center gap-2 text-primary-600 text-xl mb-4">
                  <FiShield size={24} />
                  Technical Details
                </h2>
                <p className="text-dark-700 leading-relaxed">
                  This tool is built using Next.js and Tailwind CSS for the
                  frontend, with a Node.js backend that uses Puppeteer for
                  browser automation and screenshot capturing. The backend
                  handles the rendering of web pages, locating elements via CSS
                  selectors, and capturing screenshots of those elements.
                </p>
              </div>

              <div className="bg-secondary-50 p-6 rounded-lg border border-secondary-100">
                <h2 className="flex items-center gap-2 text-secondary-600 text-xl mb-4">
                  <FiInfo size={24} />
                  Usage Tips
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <BsCheckSquareFill
                      className="text-secondary-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <span>
                      Use specific CSS selectors for more accurate targeting
                    </span>
                  </li>
                  <li className="flex items-start">
                    <BsCheckSquareFill
                      className="text-secondary-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <span>
                      Increase the wait time for pages with dynamic content
                    </span>
                  </li>
                  <li className="flex items-start">
                    <BsCheckSquareFill
                      className="text-secondary-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <span>
                      Test selectors first if you're unsure about the correct
                      selector
                    </span>
                  </li>
                  <li className="flex items-start">
                    <BsCheckSquareFill
                      className="text-secondary-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <span>
                      For ad components, use the specialized Ad Components tool
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}
