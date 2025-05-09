"use client";

import { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import { takeScreenshots } from "../../utils/api";
import { saveConfiguration, loadConfiguration } from "../../utils/storage";
import { generatePDF, savePDF } from "../../utils/pdfGenerator";

// Ad specifications from the specs.md file
const AD_CATEGORIES = [
  {
    name: "HOMEPAGE ADVERTISING SPECS",
    url: "",
    ads: [
      { id: "A", name: "Homepage Premier Feature" },
      { id: "B", name: "Homepage Feature" },
      { id: "C", name: "Homepage Organizational Feature" },
      { id: "E", name: "Homepage Video" },
    ],
  },
  {
    name: "DIRECTORY LANDING PAGE ADVERTISING SPECS",
    url: "",
    ads: [
      { id: "F", name: "Directory Headline Photo" },
      { id: "G", name: "Premier Sponsorship" },
      { id: "H", name: "Directory Premier Feature" },
      { id: "I", name: "Directory Featured Program" },
      { id: "J", name: "Directory Organizational Feature" },
      { id: "L", name: "Directory Video" },
    ],
  },
  {
    name: "SEARCH RESULTS PAGE ADVERTISING SPECS",
    url: "",
    ads: [
      { id: "M", name: "Results Headline Photo" },
      { id: "N", name: "Results Feature" },
      { id: "O", name: "Listing Photo" },
      { id: "Q", name: "Hot Jobs Listing" },
      { id: "R", name: "Results Page Flyer Ad" },
    ],
  },
  {
    name: "PREMIUM LISTING FEATURES",
    url: "",
    ads: [
      { id: "K", name: "Customized Provider Page Cover Photo" },
      {
        id: "T/D",
        name: "Listing Cover Photo / Customized Listing Cover Photo",
      },
    ],
  },
  {
    name: "ARTICLE DIRECTORY ADVERTISING",
    url: "",
    ads: [
      { id: "DD", name: "Article Directory Organizational Feature" },
      { id: "EE", name: "Article Directory Feature" },
    ],
  },
  {
    name: "TRAVEL RESOURCE ADVERTISING",
    url: "",
    ads: [
      { id: "GG", name: "Travel Resource Homepage Headline Photo" },
      { id: "HH", name: "Travel Resources Headline Photo" },
      { id: "II", name: "Travel Resource Feature" },
      { id: "KK", name: "Travel Insurance Headline Photo" },
      { id: "LL", name: "Travel Insurance Listing Feature" },
      { id: "MM", name: "Scholarship Homepage Headline Photo" },
      { id: "NN", name: "Embassy Directory Feature" },
    ],
  },
];

export default function AdComponents() {
  const [url, setUrl] = useState("");
  const [categoryUrls, setCategoryUrls] = useState(() => {
    // Initialize with empty URLs from the AD_CATEGORIES
    const initialUrls = {};
    AD_CATEGORIES.forEach((category) => {
      initialUrls[category.name] = category.url;
    });
    return initialUrls;
  });
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [waitTime, setWaitTime] = useState(1000);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [adSelectors, setAdSelectors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adScreenshots, setAdScreenshots] = useState({});

  // Initialize or update a selector for an ad
  const handleSelectorChange = (adId, value) => {
    setAdSelectors((prev) => ({
      ...prev,
      [adId]: value,
    }));
  };

  // Capture screenshots for selected ads
  const handleCaptureScreenshots = async (e) => {
    e.preventDefault();

    // Validate input
    if (selectedCategory) {
      // If a category is selected, check if it has a URL
      const categoryUrl = categoryUrls[selectedCategory];
      if (!categoryUrl) {
        setError(`Please enter a URL for ${selectedCategory}`);
        return;
      }
    } else if (!url) {
      // If no category is selected, check if the global URL is provided
      setError("Please enter a URL");
      return;
    }

    if (!selectedCategory && Object.keys(adSelectors).length === 0) {
      setError("Please select at least one ad component or enter selectors");
      return;
    }

    // Collect all active selectors
    const activeSelectors = {};
    if (selectedCategory) {
      // Get all selectors from the selected category
      const categoryAds = AD_CATEGORIES.find(
        (cat) => cat.name === selectedCategory
      ).ads;
      categoryAds.forEach((ad) => {
        if (adSelectors[ad.id]) {
          activeSelectors[`${ad.id}: ${ad.name}`] = {
            selector: adSelectors[ad.id],
            categoryName: selectedCategory,
          };
        }
      });
    } else {
      // Get all selectors that have been entered
      Object.keys(adSelectors).forEach((adId) => {
        if (adSelectors[adId]) {
          const adInfo = findAdById(adId);
          if (adInfo) {
            // Find which category this ad belongs to
            for (const category of AD_CATEGORIES) {
              const adExists = category.ads.some((ad) => ad.id === adId);
              if (adExists) {
                activeSelectors[`${adId}: ${adInfo.name}`] = {
                  selector: adSelectors[adId],
                  categoryName: category.name,
                };
                break;
              }
            }
          }
        }
      });
    }

    if (Object.keys(activeSelectors).length === 0) {
      setError("Please enter at least one CSS selector");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const results = {};

      // Process each ad selector one by one
      for (const [adName, info] of Object.entries(activeSelectors)) {
        try {
          // Determine which URL to use
          const urlToUse = categoryUrls[info.categoryName] || url;

          if (!urlToUse) {
            results[adName] = {
              error: `No URL provided for category: ${info.categoryName}`,
              selector: info.selector,
            };
            continue;
          }

          const data = await takeScreenshots({
            url: urlToUse,
            selectors: [info.selector],
            viewport: { width: viewportWidth, height: viewportHeight },
            waitTime,
          });

          if (data.screenshots && data.screenshots.length > 0) {
            results[adName] = data.screenshots[0];
          }
        } catch (err) {
          results[adName] = {
            error: err.message || "Failed to capture screenshot",
            selector: info.selector,
          };
        }
      }

      setAdScreenshots(results);
    } catch (error) {
      setError(error.message || "Failed to capture screenshots");
    } finally {
      setIsLoading(false);
    }
  };

  // Capture screenshots for all configured ads across all categories
  const handleCaptureAllScreenshots = async () => {
    // Check if there are any selectors configured
    if (Object.keys(adSelectors).length === 0) {
      setError("Please configure at least one ad selector first");
      return;
    }

    // Check if we have URLs for each category or a default URL
    const categoriesWithSelectors = new Set();
    Object.keys(adSelectors).forEach((adId) => {
      if (adSelectors[adId]) {
        for (const category of AD_CATEGORIES) {
          const adExists = category.ads.some((ad) => ad.id === adId);
          if (adExists) {
            categoriesWithSelectors.add(category.name);
            break;
          }
        }
      }
    });

    // Check that all categories with selectors have URLs
    const missingUrlCategories = [];
    categoriesWithSelectors.forEach((categoryName) => {
      if (!categoryUrls[categoryName] && !url) {
        missingUrlCategories.push(categoryName);
      }
    });

    if (missingUrlCategories.length > 0) {
      setError(
        `Please provide URLs for these categories: ${missingUrlCategories.join(
          ", "
        )}`
      );
      return;
    }

    // Collect all configured selectors
    const allSelectors = {};
    Object.keys(adSelectors).forEach((adId) => {
      if (adSelectors[adId]) {
        const adInfo = findAdById(adId);
        if (adInfo) {
          // Find which category this ad belongs to
          for (const category of AD_CATEGORIES) {
            const adExists = category.ads.some((ad) => ad.id === adId);
            if (adExists) {
              allSelectors[`${adId}: ${adInfo.name}`] = {
                selector: adSelectors[adId],
                categoryName: category.name,
              };
              break;
            }
          }
        }
      }
    });

    if (Object.keys(allSelectors).length === 0) {
      setError("No valid selectors configured");
      return;
    }

    setError(null);
    setIsLoading(true);

    console.log(
      `Starting batch capture of ${
        Object.keys(allSelectors).length
      } ad components`
    );

    try {
      const results = {};
      let capturedCount = 0;
      let errorCount = 0;

      // Process each ad selector one by one
      for (const [adName, info] of Object.entries(allSelectors)) {
        try {
          // Determine which URL to use
          const urlToUse = categoryUrls[info.categoryName] || url;

          if (!urlToUse) {
            results[adName] = {
              error: `No URL provided for category: ${info.categoryName}`,
              selector: info.selector,
            };
            errorCount++;
            continue;
          }

          console.log(`Capturing ${adName} from ${urlToUse}`);
          const data = await takeScreenshots({
            url: urlToUse,
            selectors: [info.selector],
            viewport: { width: viewportWidth, height: viewportHeight },
            waitTime,
          });

          if (data.screenshots && data.screenshots.length > 0) {
            results[adName] = data.screenshots[0];
            capturedCount++;
          }
        } catch (err) {
          console.error(`Error capturing ${adName}:`, err);
          results[adName] = {
            error: err.message || "Failed to capture screenshot",
            selector: info.selector,
          };
          errorCount++;
        }
      }

      setAdScreenshots(results);
      console.log(
        `Batch capture complete. Captured: ${capturedCount}, Errors: ${errorCount}`
      );

      // Display a summary at the top
      if (errorCount > 0) {
        setError(
          `Captured ${capturedCount} screenshots with ${errorCount} errors. See details below.`
        );
      }
    } catch (error) {
      console.error("Batch capture failed:", error);
      setError(error.message || "Failed to capture screenshots");
    } finally {
      setIsLoading(false);
    }
  };

  // Find ad information by ID
  const findAdById = (adId) => {
    for (const category of AD_CATEGORIES) {
      const ad = category.ads.find((ad) => ad.id === adId);
      if (ad) return ad;
    }
    return null;
  };

  // Save the current configuration
  const handleSaveConfig = () => {
    const config = {
      url,
      categoryUrls,
      viewportWidth,
      viewportHeight,
      waitTime,
      adSelectors,
    };

    const saved = saveConfiguration("adComponentsConfig", config);
    if (saved) {
      alert("Ad components configuration saved successfully!");
    } else {
      alert("Failed to save configuration");
    }
  };

  // Load saved configuration
  const handleLoadConfig = () => {
    const config = loadConfiguration("adComponentsConfig");
    if (config) {
      setUrl(config.url || "");
      setCategoryUrls(config.categoryUrls || {});
      setViewportWidth(config.viewportWidth || 1280);
      setViewportHeight(config.viewportHeight || 800);
      setWaitTime(config.waitTime || 1000);
      setAdSelectors(config.adSelectors || {});
    } else {
      alert("No saved configuration found");
    }
  };

  // Download all screenshots as a zip
  const handleDownloadAll = async () => {
    if (Object.keys(adScreenshots).length === 0) {
      alert("No screenshots to download");
      return;
    }

    try {
      // Check if JSZip is available, if not dynamically load it
      if (
        typeof window !== "undefined" &&
        typeof window.JSZip === "undefined"
      ) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.async = true;

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const JSZip = window.JSZip;
      const zip = new JSZip();
      const folder = zip.folder("ad_screenshots");

      // Add each screenshot to the zip
      for (const [adName, screenshot] of Object.entries(adScreenshots)) {
        if (screenshot.error) continue;

        try {
          const response = await fetch(screenshot.path);
          const blob = await response.blob();
          const safeAdName = adName.replace(/[^a-zA-Z0-9]/g, "_");
          folder.file(`${safeAdName}.png`, blob);
        } catch (error) {
          console.error(`Error adding ${adName} to zip:`, error);
        }
      }

      // Generate and download the zip
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = `ad_screenshots_${Date.now()}.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);
    } catch (error) {
      alert("Error creating zip file: " + error.message);
    }
  };

  // Generate and download a PDF report of screenshots
  const handleExportToPDF = async () => {
    if (Object.keys(adScreenshots).length === 0) {
      alert("No screenshots to export");
      return;
    }

    try {
      // Group screenshots by category
      const categorizedScreenshots = {};

      for (const [adName, screenshot] of Object.entries(adScreenshots)) {
        const adId = adName.split(":")[0].trim();

        // Find which category this ad belongs to
        for (const category of AD_CATEGORIES) {
          const adExists = category.ads.some((ad) => ad.id === adId);
          if (adExists) {
            if (!categorizedScreenshots[category.name]) {
              categorizedScreenshots[category.name] = {};
            }
            categorizedScreenshots[category.name][adName] = screenshot;
            break;
          }
        }
      }

      // Add category URLs
      categorizedScreenshots.categoryUrls = categoryUrls;

      // Generate the PDF
      const doc = await generatePDF(
        categorizedScreenshots,
        "Ad Component Screenshots Report"
      );

      // Save the PDF
      savePDF(doc, `ad_screenshots_report_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF: " + error.message);
    }
  };

  // Render the selected category's ad components
  const renderCategoryAds = () => {
    if (!selectedCategory) return null;

    const category = AD_CATEGORIES.find((cat) => cat.name === selectedCategory);
    if (!category) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5 mt-4">
        <div className="flex items-center mb-3">
          <svg
            className="w-5 h-5 text-blue-500 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
        </div>

        <div className="mb-5 bg-gray-50 p-4 rounded-md">
          <label
            htmlFor={`category-url-${selectedCategory}`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category URL
          </label>
          <input
            id={`category-url-${selectedCategory}`}
            type="url"
            placeholder="https://example.com/category-specific-page"
            value={categoryUrls[selectedCategory] || ""}
            onChange={(e) => {
              setCategoryUrls((prev) => ({
                ...prev,
                [selectedCategory]: e.target.value,
              }));
            }}
            className="form-input w-full"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This URL will be used when capturing screenshots for this category
          </p>
        </div>

        <h4 className="text-md font-medium text-gray-700 mb-3">
          Ad Components
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.ads.map((ad) => (
            <div
              key={ad.id}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor={`ad-${ad.id}`}
                  className="block font-medium text-gray-700"
                >
                  <span className="text-blue-600 font-bold">{ad.id}:</span>{" "}
                  {ad.name}
                </label>
              </div>
              <textarea
                id={`ad-${ad.id}`}
                value={adSelectors[ad.id] || ""}
                onChange={(e) => handleSelectorChange(ad.id, e.target.value)}
                placeholder="Enter CSS selector (e.g., .banner-container)"
                className="form-textarea text-sm w-full"
                rows="2"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render screenshots by category
  const renderScreenshotsByCategory = () => {
    if (Object.keys(adScreenshots).length === 0) return null;

    // Group screenshots by category
    const categorizedScreenshots = {};

    for (const [adName, screenshot] of Object.entries(adScreenshots)) {
      const adId = adName.split(":")[0].trim();

      // Find which category this ad belongs to
      for (const category of AD_CATEGORIES) {
        const adExists = category.ads.some((ad) => ad.id === adId);
        if (adExists) {
          if (!categorizedScreenshots[category.name]) {
            categorizedScreenshots[category.name] = {};
          }
          categorizedScreenshots[category.name][adName] = screenshot;
          break;
        }
      }
    }

    return (
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-dark-800 mb-4 md:mb-0">
            Ad Screenshots
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadAll}
              className="btn btn-secondary flex items-center gap-2"
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
                className="flex-shrink-0"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download All
            </button>
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
                className="flex-shrink-0"
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

        {Object.entries(categorizedScreenshots).map(
          ([categoryName, screenshots]) => (
            <div key={categoryName} className="mb-8">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {categoryName}
                </h3>
                {categoryUrls[categoryName] && (
                  <p className="text-sm text-gray-500">
                    URL:{" "}
                    <a
                      href={categoryUrls[categoryName]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {categoryUrls[categoryName]}
                    </a>
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(screenshots).map(([adName, screenshot]) => (
                  <div
                    key={adName}
                    className={`screenshot-item border border-gray-200 rounded-lg overflow-hidden ${
                      screenshot.error
                        ? "border-red-300 bg-red-50"
                        : "bg-white hover:shadow-md transition-shadow"
                    }`}
                  >
                    {screenshot.error ? (
                      <div className="p-4">
                        <div className="screenshot-info">
                          <div className="flex items-center mb-2">
                            <svg
                              className="w-5 h-5 text-red-500 mr-2"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="text-sm font-medium text-red-700">
                              {adName}
                            </div>
                          </div>
                          <p className="text-red-600 text-sm">
                            Error: {screenshot.error}
                          </p>

                          {screenshot.error.includes(
                            "does not exist on the page"
                          ) && (
                            <div className="mt-3 bg-yellow-50 border border-yellow-100 p-3 rounded text-xs">
                              <p className="font-semibold mb-1">Suggestions:</p>
                              <ul className="list-disc pl-4 space-y-1">
                                <li>Check for typos in your selector</li>
                                <li>Try a more general selector</li>
                                <li>Increase the wait time</li>
                                <li>
                                  Use browser dev tools to verify the selector
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="aspect-video relative overflow-hidden bg-gray-100 border-b">
                          <img
                            src={screenshot.path}
                            alt={`Screenshot of ${adName}`}
                            className="screenshot-image w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="text-sm font-medium text-gray-800">
                              <span className="text-blue-600 font-bold">
                                {adName.split(":")[0].trim()}:
                              </span>
                              {adName.split(":")[1].trim()}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded-md">
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Size:</span>{" "}
                                {Math.round(screenshot.width)}px ×{" "}
                                {Math.round(screenshot.height)}px
                              </p>
                              <a
                                href={screenshot.path}
                                download={`${adName.replace(
                                  /[^a-zA-Z0-9]/g,
                                  "_"
                                )}_${Date.now()}.png`}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Download
                              </a>
                            </div>
                          </div>

                          {screenshot.images &&
                            screenshot.images.length > 0 && (
                              <div className="mt-3 border-t border-gray-100 pt-3">
                                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1 text-blue-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Images Found ({screenshot.images.length})
                                </p>
                                <div className="space-y-2">
                                  {screenshot.images.map((img, idx) => (
                                    <div
                                      key={idx}
                                      className="text-xs bg-gray-50 p-2 rounded-md"
                                    >
                                      <div className="flex justify-between">
                                        <p className="font-medium text-gray-700">
                                          Image #{idx + 1}
                                        </p>
                                        <p className="text-gray-500">
                                          Ratio:{" "}
                                          {typeof img.aspectRatio === "number"
                                            ? img.aspectRatio.toFixed(2)
                                            : "Unknown"}
                                        </p>
                                      </div>
                                      <div className="flex flex-col sm:flex-row sm:justify-between mt-1 text-gray-600">
                                        <p>
                                          Displayed: {img.renderedWidth}×
                                          {img.renderedHeight}px
                                        </p>
                                        <p>
                                          Natural: {img.naturalWidth}×
                                          {img.naturalHeight}px
                                        </p>
                                      </div>
                                      {(img.renderedWidth > img.naturalWidth ||
                                        img.renderedHeight >
                                          img.naturalHeight) && (
                                        <p className="text-orange-600 mt-1 flex items-center">
                                          <svg
                                            className="w-4 h-4 mr-1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          Image is stretched (Width:{" "}
                                          {typeof img.widthScaling === "number"
                                            ? img.widthScaling.toFixed(2)
                                            : "Unknown"}
                                          , Height:{" "}
                                          {typeof img.heightScaling === "number"
                                            ? img.heightScaling.toFixed(2)
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
          )
        )}
      </div>
    );
  };
  return (
    <main className="max-w-7xl mx-auto">
      <DashboardHeader
        title="Ad Component Screenshots"
        subtitle="Capture screenshots of specific ad components on websites"
      />

      <div className="dashboard-card bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl font-bold text-dark-800">
            Ad Component Configuration
          </h2>
          <p className="text-dark-600 mt-1">
            Capture screenshots of ad components across different advertising
            specifications. Select an ad category or individually configure
            selectors for specific ad components.
          </p>
        </div>

        <form onSubmit={handleCaptureScreenshots} className="space-y-6">
          {/* URL Configuration Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-md font-medium text-gray-800 mb-3">
              URL Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="website-url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Default URL
                </label>
                <input
                  id="website-url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="form-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used when a category doesn't have a specific URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Category
                </label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="form-input"
                >
                  <option value="">Select a category (optional)</option>
                  {AD_CATEGORIES.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select a category to configure specific ad components
                </p>
              </div>
            </div>
          </div>

          {!selectedCategory && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-md font-medium text-gray-800">
                  Category URLs
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Set specific URLs for each category to capture screenshots from
                different pages.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AD_CATEGORIES.map((category) => (
                  <div
                    key={category.name}
                    className="flex flex-col p-3 bg-gray-50 rounded-md"
                  >
                    <label
                      htmlFor={`category-url-${category.name}`}
                      className="block text-sm font-medium text-gray-700 mb-1 truncate"
                      title={category.name}
                    >
                      {category.name}
                    </label>
                    <input
                      id={`category-url-${category.name}`}
                      type="url"
                      placeholder="https://example.com/category-page"
                      value={categoryUrls[category.name] || ""}
                      onChange={(e) => {
                        setCategoryUrls((prev) => ({
                          ...prev,
                          [category.name]: e.target.value,
                        }));
                      }}
                      className="form-input text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {renderCategoryAds()}

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg
                className="w-5 h-5 text-blue-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 0v12h12V4H4z"
                  clipRule="evenodd"
                />
                <path d="M13 8V6H7v2h6z" />
              </svg>
              <h3 className="text-md font-medium text-gray-800">
                Viewport Settings
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Configure screenshot dimensions and timing parameters.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <label
                  htmlFor="viewport-width"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Viewport Width (px)
                </label>
                <div className="flex items-center">
                  <input
                    id="viewport-width"
                    type="number"
                    min="320"
                    value={viewportWidth}
                    onChange={(e) => setViewportWidth(Number(e.target.value))}
                    className="form-input"
                  />
                  <span className="text-sm text-gray-500 ml-2">px</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <label
                  htmlFor="viewport-height"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Viewport Height (px)
                </label>
                <div className="flex items-center">
                  <input
                    id="viewport-height"
                    type="number"
                    min="320"
                    value={viewportHeight}
                    onChange={(e) => setViewportHeight(Number(e.target.value))}
                    className="form-input"
                  />
                  <span className="text-sm text-gray-500 ml-2">px</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <label
                  htmlFor="wait-time"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Wait Time (ms)
                </label>
                <div className="flex items-center">
                  <input
                    id="wait-time"
                    type="number"
                    min="0"
                    step="100"
                    value={waitTime}
                    onChange={(e) => setWaitTime(Number(e.target.value))}
                    className="form-input"
                  />
                  <span className="text-sm text-gray-500 ml-2">ms</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Time to wait for dynamic content to load
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded-r-md">
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

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-md font-medium text-gray-800 mb-1">
                  Actions
                </h3>
                <p className="text-sm text-gray-600">
                  Capture screenshots, save or load your configuration
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="btn btn-primary flex items-center"
                  disabled={isLoading}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isLoading
                    ? "Capturing Screenshots..."
                    : "Capture Selected Screenshots"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary flex items-center"
                  onClick={handleSaveConfig}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm12 0H5v10h10V5z"
                      clipRule="evenodd"
                    />
                    <path d="M4 4a1 1 0 011-1h4a1 1 0 010 2H5a1 1 0 01-1-1z" />
                  </svg>
                  Save Configuration
                </button>

                <button
                  type="button"
                  className="btn btn-secondary flex items-center"
                  onClick={handleLoadConfig}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Load Configuration
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-blue-800">
                Batch Processing
              </h3>
            </div>
            <p className="text-sm text-blue-600 mb-4">
              Capture screenshots of all configured ad components across all
              categories at once. Make sure you've set up selectors and URLs for
              each category you want to capture.
            </p>
            <button
              type="button"
              className="btn bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto flex items-center justify-center"
              onClick={handleCaptureAllScreenshots}
              disabled={isLoading}
            >
              <svg
                className="w-4 h-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
              </svg>
              {isLoading
                ? "Capturing All Screenshots..."
                : "Capture All Configured Ads"}
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 text-center">
          <LoadingSpinner message="Taking screenshots..." />
        </div>
      ) : (
        renderScreenshotsByCategory()
      )}
    </main>
  );
}
