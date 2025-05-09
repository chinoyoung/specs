"use client";

import { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import Tabs from "../../components/Tabs";
import LoadingSpinner from "../../components/LoadingSpinner";
import SelectorTester from "../../components/SelectorTester";
import { takeScreenshots, batchScreenshots } from "../../utils/api";
import { saveConfiguration, loadConfiguration } from "../../utils/storage";
import { generatePDF, savePDF } from "../../utils/pdfGenerator";

export default function GeneralScreenshots() {
  const [activeTab, setActiveTab] = useState("single");
  const [url, setUrl] = useState("");
  const [selectors, setSelectors] = useState({});
  const [selectorCount, setSelectorCount] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [waitTime, setWaitTime] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [showTester, setShowTester] = useState(false);

  // Batch mode states
  const [urls, setUrls] = useState([""]);
  const [batchSelectors, setBatchSelectors] = useState([""]);

  // Add a selector input field
  const handleAddSelector = () => {
    setSelectorCount((prev) => prev + 1);
  };

  // Remove a selector input field
  const handleRemoveSelector = (index) => {
    const updatedSelectors = { ...selectors };
    delete updatedSelectors[`selector-${index}`];
    setSelectors(updatedSelectors);
  };

  // Update selector value
  const handleSelectorChange = (index, value) => {
    setSelectors((prev) => ({
      ...prev,
      [`selector-${index}`]: value,
    }));
  };

  // Add a URL input field for batch mode
  const handleAddUrl = () => {
    setUrls((prev) => [...prev, ""]);
  };

  // Update URL in batch mode
  const handleBatchUrlChange = (index, value) => {
    const updatedUrls = [...urls];
    updatedUrls[index] = value;
    setUrls(updatedUrls);
  };

  // Remove a URL from batch mode
  const handleRemoveUrl = (index) => {
    const updatedUrls = [...urls];
    updatedUrls.splice(index, 1);
    setUrls(updatedUrls);
  };

  // Add a selector input field for batch mode
  const handleAddBatchSelector = () => {
    setBatchSelectors((prev) => [...prev, ""]);
  };

  // Update selector in batch mode
  const handleBatchSelectorChange = (index, value) => {
    const updatedSelectors = [...batchSelectors];
    updatedSelectors[index] = value;
    setBatchSelectors(updatedSelectors);
  };

  // Remove a selector from batch mode
  const handleRemoveBatchSelector = (index) => {
    const updatedSelectors = [...batchSelectors];
    updatedSelectors.splice(index, 1);
    setBatchSelectors(updatedSelectors);
  };

  // Capture screenshots in single URL mode
  const handleCaptureScreenshots = async (e) => {
    e.preventDefault();

    if (!url) {
      setError("Please enter a URL");
      return;
    }

    const selectorList = Object.values(selectors).filter(Boolean);

    if (selectorList.length === 0) {
      setError("Please enter at least one CSS selector");
      return;
    }

    setError(null);
    setIsLoading(true);
    setScreenshots([]);

    try {
      const data = await takeScreenshots({
        url,
        selectors: selectorList,
        viewport: { width: viewportWidth, height: viewportHeight },
        waitTime,
      });

      if (data.screenshots) {
        setScreenshots(data.screenshots);
      }
    } catch (error) {
      console.error("Error taking screenshots:", error);
      setError(error.message || "Failed to take screenshots");
    } finally {
      setIsLoading(false);
    }
  };

  // Capture screenshots in batch mode
  const handleBatchScreenshots = async (e) => {
    e.preventDefault();

    const validUrls = urls.filter(Boolean);
    const validSelectors = batchSelectors.filter(Boolean);

    if (validUrls.length === 0) {
      setError("Please enter at least one URL");
      return;
    }

    if (validSelectors.length === 0) {
      setError("Please enter at least one CSS selector");
      return;
    }

    setError(null);
    setIsLoading(true);
    setScreenshots([]);

    try {
      const data = await batchScreenshots({
        urls: validUrls,
        selectors: validSelectors,
        viewport: { width: viewportWidth, height: viewportHeight },
        waitTime,
      });

      if (data.batchResults) {
        // Flatten the batch results into a single array of screenshots
        const allScreenshots = [];
        data.batchResults.forEach((result) => {
          if (result.screenshots) {
            result.screenshots.forEach((screenshot) => {
              allScreenshots.push({
                ...screenshot,
                url: result.url,
              });
            });
          }
        });

        setScreenshots(allScreenshots);
      }
    } catch (error) {
      console.error("Error taking batch screenshots:", error);
      setError(error.message || "Failed to take batch screenshots");
    } finally {
      setIsLoading(false);
    }
  };

  // Save the current configuration
  const handleSaveConfig = () => {
    const config = {
      activeTab,
      url,
      selectors,
      selectorCount,
      viewportWidth,
      viewportHeight,
      waitTime,
      urls,
      batchSelectors,
    };

    const saved = saveConfiguration("generalScreenshotsConfig", config);
    if (saved) {
      alert("Configuration saved successfully!");
    } else {
      alert("Failed to save configuration");
    }
  };

  // Load saved configuration
  const handleLoadConfig = () => {
    const config = loadConfiguration("generalScreenshotsConfig");
    if (config) {
      setActiveTab(config.activeTab || "single");
      setUrl(config.url || "");
      setSelectors(config.selectors || {});
      setSelectorCount(config.selectorCount || 1);
      setViewportWidth(config.viewportWidth || 1280);
      setViewportHeight(config.viewportHeight || 800);
      setWaitTime(config.waitTime || 1000);
      setUrls(config.urls || [""]);
      setBatchSelectors(config.batchSelectors || [""]);
    } else {
      alert("No saved configuration found");
    }
  };

  // Generate and download a PDF report of screenshots
  const handleExportToPDF = async () => {
    if (screenshots.length === 0) {
      alert("No screenshots to export");
      return;
    }

    try {
      // Format data for PDF generation
      const screenshotData = {
        "General Screenshots": {},
      };

      // Add each screenshot to the data
      screenshots.forEach((screenshot, index) => {
        const name = screenshot.selector || `Screenshot ${index + 1}`;
        screenshotData["General Screenshots"][name] = screenshot;
      });

      // Generate the PDF
      const doc = await generatePDF(
        screenshotData,
        "General Screenshots Report"
      );

      // Save the PDF
      savePDF(doc, `general_screenshots_report_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF: " + error.message);
    }
  };

  // Render the form for single URL mode
  const renderSingleForm = () => (
    <form onSubmit={handleCaptureScreenshots} className="space-y-6">
      <div>
        <label
          htmlFor="website-url"
          className="block text-sm font-medium text-dark-700 mb-1"
        >
          Website URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
              className="text-dark-400"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <input
            id="website-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="form-input pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm text-dark-700 border-dark-200 rounded-md"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-dark-700">
            CSS Selectors
          </label>
          <button
            type="button"
            className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
            onClick={handleAddSelector}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Add Selector
          </button>
        </div>

        <div className="space-y-3">
          {Array.from({ length: selectorCount }, (_, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder={`CSS selector ${index + 1}`}
                value={selectors[`selector-${index}`] || ""}
                onChange={(e) => handleSelectorChange(index, e.target.value)}
                className="form-input block w-full shadow-sm text-dark-700 border-dark-200 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                className="p-2 text-dark-500 hover:text-secondary-500 hover:bg-secondary-50 rounded-md transition-colors"
                onClick={() => handleRemoveSelector(index)}
              >
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="viewport-width"
            className="block text-sm font-medium text-dark-700 mb-1"
          >
            Viewport Width (px)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                className="text-dark-400"
              >
                <path d="M21 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19V5C23 3.89543 22.1046 3 21 3Z"></path>
                <path d="M4 8h16"></path>
              </svg>
            </div>
            <input
              id="viewport-width"
              type="number"
              min="320"
              value={viewportWidth}
              onChange={(e) => setViewportWidth(Number(e.target.value))}
              className="form-input pl-10 block w-full shadow-sm text-dark-700 border-dark-200 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="viewport-height"
            className="block text-sm font-medium text-dark-700 mb-1"
          >
            Viewport Height (px)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                className="text-dark-400"
              >
                <path d="M21 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19V5C23 3.89543 22.1046 3 21 3Z"></path>
                <path d="M9 21V3"></path>
              </svg>
            </div>
            <input
              id="viewport-height"
              type="number"
              min="320"
              value={viewportHeight}
              onChange={(e) => setViewportHeight(Number(e.target.value))}
              className="form-input pl-10 block w-full shadow-sm text-dark-700 border-dark-200 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="wait-time"
            className="block text-sm font-medium text-dark-700 mb-1"
          >
            Wait Time (ms)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                className="text-dark-400"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <input
              id="wait-time"
              type="number"
              min="0"
              step="100"
              value={waitTime}
              onChange={(e) => setWaitTime(Number(e.target.value))}
              className="form-input pl-10 block w-full shadow-sm text-dark-700 border-dark-200 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="btn btn-primary flex items-center gap-2"
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
              Capturing Screenshots...
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              Capture Screenshots
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary flex items-center gap-2"
          onClick={() => setShowTester(true)}
        >
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
        </button>

        <button
          type="button"
          className="btn btn-secondary flex items-center gap-2"
          onClick={handleSaveConfig}
        >
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
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Save Configuration
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleLoadConfig}
        >
          Load Configuration
        </button>
      </div>
    </form>
  );

  // Render the form for batch mode
  const renderBatchForm = () => (
    <form onSubmit={handleBatchScreenshots} className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Website URLs
          </label>
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={handleAddUrl}
          >
            + Add URL
          </button>
        </div>

        <div className="space-y-3">
          {urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => handleBatchUrlChange(index, e.target.value)}
                className="form-input"
              />
              {urls.length > 1 && (
                <button
                  type="button"
                  className="px-2 text-gray-500 hover:text-red-500"
                  onClick={() => handleRemoveUrl(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            CSS Selectors
          </label>
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={handleAddBatchSelector}
          >
            + Add Selector
          </button>
        </div>

        <div className="space-y-3">
          {batchSelectors.map((selector, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder={`CSS selector ${index + 1}`}
                value={selector}
                onChange={(e) =>
                  handleBatchSelectorChange(index, e.target.value)
                }
                className="form-input"
              />
              {batchSelectors.length > 1 && (
                <button
                  type="button"
                  className="px-2 text-gray-500 hover:text-red-500"
                  onClick={() => handleRemoveBatchSelector(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="batch-viewport-width"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Viewport Width (px)
          </label>
          <input
            id="batch-viewport-width"
            type="number"
            min="320"
            value={viewportWidth}
            onChange={(e) => setViewportWidth(Number(e.target.value))}
            className="form-input"
          />
        </div>

        <div>
          <label
            htmlFor="batch-viewport-height"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Viewport Height (px)
          </label>
          <input
            id="batch-viewport-height"
            type="number"
            min="320"
            value={viewportHeight}
            onChange={(e) => setViewportHeight(Number(e.target.value))}
            className="form-input"
          />
        </div>

        <div>
          <label
            htmlFor="batch-wait-time"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Wait Time (ms)
          </label>
          <input
            id="batch-wait-time"
            type="number"
            min="0"
            step="100"
            value={waitTime}
            onChange={(e) => setWaitTime(Number(e.target.value))}
            className="form-input"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Processing Batch..." : "Process Batch"}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleSaveConfig}
        >
          Save Configuration
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleLoadConfig}
        >
          Load Configuration
        </button>
      </div>
    </form>
  );

  // Render the screenshot results
  const renderScreenshots = () => {
    if (screenshots.length === 0) return null;

    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-dark-800">
            Screenshot Results
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportToPDF}
              className="btn btn-primary flex items-center gap-2"
            >
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
                <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                <path d="M9 17h6"></path>
                <path d="M9 13h6"></path>
              </svg>
              Export to PDF
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screenshots.map((screenshot, index) => (
            <div
              key={index}
              className={`screenshot-item ${
                screenshot.error ? "screenshot-error-item" : ""
              }`}
            >
              {screenshot.error ? (
                <div className="p-4">
                  <div className="text-sm font-medium mb-2">
                    Error: {screenshot.selector}
                  </div>
                  <p className="text-red-600 text-sm">{screenshot.error}</p>
                </div>
              ) : (
                <>
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    <img
                      src={screenshot.path}
                      alt={`Screenshot of ${screenshot.selector}`}
                      className="screenshot-image w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-dark-800">
                        {screenshot.selector}
                      </div>
                    </div>
                    {screenshot.url && (
                      <p className="text-xs text-dark-500 mb-2 break-all">
                        {screenshot.url}
                      </p>
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-dark-500">
                        Element: {Math.round(screenshot.width)}px ×{" "}
                        {Math.round(screenshot.height)}px
                      </p>
                      <a
                        href={screenshot.path}
                        download={`screenshot_${index}_${Date.now()}.png`}
                        className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                      </a>
                    </div>

                    {screenshot.images && screenshot.images.length > 0 && (
                      <div className="mt-2 border-t border-dark-100 pt-2">
                        <p className="text-xs font-semibold text-dark-700 mb-1">
                          Images found:
                        </p>
                        <div className="space-y-1">
                          {screenshot.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-dark-600 bg-dark-50 p-2 rounded-md"
                            >
                              <p>
                                Image #{idx + 1}: {img.renderedWidth}px ×{" "}
                                {img.renderedHeight}px
                              </p>
                              <p className="text-dark-500 text-xs">
                                Natural: {img.naturalWidth}px ×{" "}
                                {img.naturalHeight}px (Aspect ratio:{" "}
                                {typeof img.aspectRatio === "number"
                                  ? img.aspectRatio.toFixed(2)
                                  : "Unknown"}
                                )
                              </p>
                              {(img.renderedWidth > img.naturalWidth ||
                                img.renderedHeight > img.naturalHeight) && (
                                <p className="text-secondary-600 text-xs font-medium mt-1 flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line
                                      x1="12"
                                      y1="17"
                                      x2="12.01"
                                      y2="17"
                                    ></line>
                                  </svg>
                                  Warning: Image is stretched beyond its natural
                                  size (Width:{" "}
                                  {typeof img.widthScaling === "string"
                                    ? img.widthScaling
                                    : "Unknown"}
                                  , Height:{" "}
                                  {typeof img.heightScaling === "string"
                                    ? img.heightScaling
                                    : "Unknown"}
                                  )
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "single", label: "Single URL" },
    { id: "batch", label: "Batch Mode" },
  ];

  return (
    <main>
      <DashboardHeader
        title="General Screenshots"
        subtitle="Capture screenshots of any elements on websites using CSS selectors"
      />

      <div className="dashboard-card p-6 mb-8">
        <h2 className="text-xl font-bold text-dark-800 mb-4">
          General Screenshot Configuration
        </h2>
        <p className="text-dark-600 mb-6">
          Capture screenshots of any elements on websites using CSS selectors.
        </p>

        <Tabs tabs={tabs} defaultTab="single" onChange={setActiveTab} />

        {error && (
          <div className="bg-secondary-50 border-l-4 border-secondary-500 p-4 my-6 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-secondary-500"
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
                <p className="text-secondary-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "single" ? renderSingleForm() : renderBatchForm()}

        <div className="mt-6">
          <button
            onClick={handleExportToPDF}
            className="btn btn-success flex items-center gap-2"
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
                Generating PDF...
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
                  <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                  <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                  <path d="M9 17h6"></path>
                  <path d="M9 13h6"></path>
                </svg>
                Export to PDF
              </>
            )}
          </button>
        </div>
      </div>

      {showTester && (
        <SelectorTester
          url={url}
          selectors={selectors}
          onClose={() => setShowTester(false)}
        />
      )}

      {isLoading ? (
        <LoadingSpinner
          message={
            activeTab === "single"
              ? "Taking screenshots..."
              : "Processing batch..."
          }
        />
      ) : (
        renderScreenshots()
      )}
    </main>
  );
}
