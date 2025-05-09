"use client";

import { useState } from "react";
import Header from "../../components/Header";
import LoadingSpinner from "../../components/LoadingSpinner";
import { takeScreenshots } from "../../utils/api";
import { saveConfiguration, loadConfiguration } from "../../utils/storage";

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

  // Render the selected category's ad components
  const renderCategoryAds = () => {
    if (!selectedCategory) return null;

    const category = AD_CATEGORIES.find((cat) => cat.name === selectedCategory);
    if (!category) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {category.name}
        </h3>

        <div className="mb-4">
          <label
            htmlFor={`category-url-${selectedCategory}`}
            className="block text-sm font-medium text-gray-700 mb-1"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.ads.map((ad) => (
            <div
              key={ad.id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor={`ad-${ad.id}`}
                  className="block font-medium text-gray-700"
                >
                  Ad {ad.id}: {ad.name}
                </label>
              </div>
              <textarea
                id={`ad-${ad.id}`}
                value={adSelectors[ad.id] || ""}
                onChange={(e) => handleSelectorChange(ad.id, e.target.value)}
                placeholder="Enter CSS selector"
                className="form-textarea text-sm"
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
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Ad Screenshots
          </h2>
          <button onClick={handleDownloadAll} className="btn btn-secondary">
            Download All
          </button>
        </div>

        {Object.entries(categorizedScreenshots).map(
          ([categoryName, screenshots]) => (
            <div key={categoryName} className="mb-8">
              <div className="border-b border-gray-200 pb-2 mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {categoryName}
                </h3>
                {categoryUrls[categoryName] && (
                  <p className="text-sm text-gray-500 mt-1">
                    URL: {categoryUrls[categoryName]}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(screenshots).map(([adName, screenshot]) => (
                  <div
                    key={adName}
                    className={`screenshot-item ${
                      screenshot.error ? "screenshot-error-item" : ""
                    }`}
                  >
                    {screenshot.error ? (
                      <div className="p-4">
                        <div className="screenshot-info">
                          <div className="text-sm font-medium mb-2">
                            {adName}
                          </div>
                          <p className="text-red-600 text-sm">
                            Error: {screenshot.error}
                          </p>

                          {screenshot.error.includes(
                            "does not exist on the page"
                          ) && (
                            <div className="mt-3 bg-yellow-50 p-3 rounded text-xs">
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
                        <div className="aspect-video relative overflow-hidden bg-gray-100">
                          <img
                            src={screenshot.path}
                            alt={`Screenshot of ${adName}`}
                            className="screenshot-image w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-medium">{adName}</div>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-gray-500">
                              Element: {Math.round(screenshot.width)}px ×{" "}
                              {Math.round(screenshot.height)}px
                            </p>
                            <a
                              href={screenshot.path}
                              download={`${adName.replace(
                                /[^a-zA-Z0-9]/g,
                                "_"
                              )}_${Date.now()}.png`}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Download
                            </a>
                          </div>

                          {screenshot.images &&
                            screenshot.images.length > 0 && (
                              <div className="mt-2 border-t pt-2">
                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                  Images found:
                                </p>
                                <div className="space-y-1">
                                  {screenshot.images.map((img, idx) => (
                                    <div
                                      key={idx}
                                      className="text-xs text-gray-600"
                                    >
                                      <p>
                                        Image #{idx + 1}: {img.renderedWidth}px
                                        × {img.renderedHeight}px
                                      </p>
                                      <p className="text-gray-500 text-xs">
                                        Natural: {img.naturalWidth}px ×{" "}
                                        {img.naturalHeight}px (Aspect ratio:{" "}
                                        {img.aspectRatio})
                                      </p>
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
    <main>
      <Header />

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Ad Component Screenshot Tool
        </h1>
        <p className="text-gray-600 mb-6">
          Capture screenshots of ad components across different advertising
          specifications. Select an ad category or individually configure
          selectors for specific ad components.
        </p>

        <form onSubmit={handleCaptureScreenshots} className="space-y-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
          </div>

          {!selectedCategory && (
            <div className="mt-4 mb-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Category URLs
              </h3>
              <div className="grid grid-cols-1 gap-3 md:gap-4 bg-gray-50 p-3 rounded-lg">
                {AD_CATEGORIES.map((category) => (
                  <div key={category.name} className="flex flex-col">
                    <label
                      htmlFor={`category-url-${category.name}`}
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      {category.name}
                    </label>
                    <input
                      id={`category-url-${category.name}`}
                      type="url"
                      placeholder="https://example.com/category-specific-page"
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
              <p className="text-xs text-gray-500 mt-1">
                You can set specific URLs for each category
              </p>
            </div>
          )}

          {renderCategoryAds()}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="viewport-width"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Viewport Width (px)
              </label>
              <input
                id="viewport-width"
                type="number"
                min="320"
                value={viewportWidth}
                onChange={(e) => setViewportWidth(Number(e.target.value))}
                className="form-input"
              />
            </div>

            <div>
              <label
                htmlFor="viewport-height"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Viewport Height (px)
              </label>
              <input
                id="viewport-height"
                type="number"
                min="320"
                value={viewportHeight}
                onChange={(e) => setViewportHeight(Number(e.target.value))}
                className="form-input"
              />
            </div>

            <div>
              <label
                htmlFor="wait-time"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Wait Time (ms)
              </label>
              <input
                id="wait-time"
                type="number"
                min="0"
                step="100"
                value={waitTime}
                onChange={(e) => setWaitTime(Number(e.target.value))}
                className="form-input"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
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

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Capturing Screenshots..." : "Capture Screenshots"}
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
      </div>

      {isLoading ? (
        <LoadingSpinner message="Taking screenshots..." />
      ) : (
        renderScreenshotsByCategory()
      )}
    </main>
  );
}
