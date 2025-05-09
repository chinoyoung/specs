document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const urlInput = document.getElementById("website-url");
  const urlsTextarea = document.getElementById("website-urls");
  const batchSelectorsInput = document.getElementById("batch-css-selectors");
  const selectorsInput = document.getElementById("css-selectors");
  const viewportWidthInput = document.getElementById("viewport-width");
  const viewportHeightInput = document.getElementById("viewport-height");
  const waitTimeInput = document.getElementById("wait-time");
  const takeScreenshotsBtn = document.getElementById("take-screenshots");
  const runBatchBtn = document.getElementById("run-batch");
  const downloadAllBtn = document.getElementById("download-all");
  const testSelectorsBtn = document.getElementById("test-selectors");
  const saveConfigBtn = document.getElementById("save-config");
  const loadConfigBtn = document.getElementById("load-config");
  const loadingIndicator = document.getElementById("loading");
  const errorMessage = document.getElementById("error-message");
  const resultsContainer = document.getElementById("results-container");
  const screenshotsGrid = document.getElementById("screenshots-grid");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const groupedModeCheckbox = document.getElementById("grouped-mode");
  const groupedInputContainer = document.getElementById(
    "grouped-input-container"
  );
  const batchInputContainer = document.getElementById("batch-input-container");
  const addGroupBtn = document.getElementById("add-group");
  const singleUrlSelectorsContainer = document.getElementById(
    "single-url-selectors"
  );

  // Group mode toggle
  if (groupedModeCheckbox) {
    groupedModeCheckbox.addEventListener("change", () => {
      if (groupedModeCheckbox.checked) {
        groupedInputContainer.style.display = "block";
        batchInputContainer.style.display = "none";
      } else {
        groupedInputContainer.style.display = "none";
        batchInputContainer.style.display = "block";
      }
    });
  }

  // Add group button
  if (addGroupBtn) {
    addGroupBtn.addEventListener("click", addNewGroup);
  }

  // Remove group button delegation
  document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("remove-group")) {
      const group = e.target.closest(".url-selector-group");
      if (
        group &&
        document.querySelectorAll(".url-selector-group").length > 1
      ) {
        group.remove();
      } else {
        alert("You must have at least one URL-selector group");
      }
    }
  });

  function addNewGroup() {
    const newGroup = document.createElement("div");
    newGroup.className = "url-selector-group";
    newGroup.innerHTML = `
      <div class="form-group">
        <label>URL:</label>
        <input type="url" class="group-url" placeholder="https://example.com" required />
      </div>
      <div class="form-group">
        <label>CSS Selectors for this URL (one per line):</label>
        <textarea 
          class="group-selectors" 
          rows="3" 
          placeholder=".header-section
#main-content" 
          required
        ></textarea>
      </div>
      <button type="button" class="btn btn-secondary remove-group">Remove</button>
    `;

    // Insert before the add button
    addGroupBtn.parentNode.insertBefore(newGroup, addGroupBtn);
  }

  // Tab switching functionality
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and content
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding content
      button.classList.add("active");
      const tabId = button.getAttribute("data-tab");
      document.getElementById(`${tabId}-tab`).classList.add("active");

      // Show/hide the single URL selectors based on active tab
      if (tabId === "single-url") {
        singleUrlSelectorsContainer.style.display = "block";
      } else {
        singleUrlSelectorsContainer.style.display = "none";
      }
    });
  });

  // Initialize to show/hide single URL selectors based on active tab
  const activeTab = document.querySelector(".tab-btn.active");
  if (activeTab) {
    const tabId = activeTab.getAttribute("data-tab");
    if (tabId === "multiple-urls") {
      singleUrlSelectorsContainer.style.display = "none";
    }
  }

  // Event listeners
  takeScreenshotsBtn.addEventListener("click", handleTakeScreenshots);
  runBatchBtn.addEventListener("click", handleBatchProcess);
  testSelectorsBtn.addEventListener("click", handleTestSelectors);
  saveConfigBtn.addEventListener("click", saveConfiguration);
  loadConfigBtn.addEventListener("click", loadConfiguration);

  if (downloadAllBtn) {
    downloadAllBtn.addEventListener("click", handleDownloadAll);
  }

  // Add listener for any copy buttons added dynamically to the document
  document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("copy-btn")) {
      const selector = e.target.getAttribute("data-selector");
      if (selector) {
        navigator.clipboard
          .writeText(selector)
          .then(() => {
            // Show temporary feedback
            const originalText = e.target.textContent;
            e.target.textContent = "Copied!";
            e.target.classList.add("copied");

            // Reset after 2 seconds
            setTimeout(() => {
              e.target.textContent = originalText;
              e.target.classList.remove("copied");
            }, 2000);
          })
          .catch((err) => {
            console.error("Failed to copy: ", err);
            alert("Failed to copy selector");
          });
      }
    }
  });

  /**
   * Saves the current configuration to localStorage
   */
  function saveConfiguration() {
    // Get the active tab
    const activeTab = document
      .querySelector(".tab-btn.active")
      .getAttribute("data-tab");
    const isBatchMode = activeTab === "multiple-urls";
    const isGroupedMode =
      isBatchMode && groupedModeCheckbox && groupedModeCheckbox.checked;

    let config = {
      isBatchMode,
      url: urlInput.value.trim(),
      selectors: selectorsInput.value.trim(),
      viewportWidth: viewportWidthInput.value,
      viewportHeight: viewportHeightInput.value,
      waitTime: waitTimeInput.value,
    };

    if (isBatchMode) {
      if (isGroupedMode) {
        // Save grouped URL-selector pairs
        const groups = [];
        document.querySelectorAll(".url-selector-group").forEach((group) => {
          const url = group.querySelector(".group-url").value.trim();
          const selectors = group
            .querySelector(".group-selectors")
            .value.trim();
          if (url && selectors) {
            groups.push({ url, selectors });
          }
        });

        config = {
          ...config,
          isGroupedMode,
          groups,
        };
      } else {
        // Save regular batch configuration
        config = {
          ...config,
          isGroupedMode: false,
          urls: urlsTextarea.value.trim(),
          batchSelectors: batchSelectorsInput.value.trim(),
        };
      }
    }

    localStorage.setItem("screenshotConfig", JSON.stringify(config));
    alert("Configuration saved successfully!");
  }

  /**
   * Loads saved configuration from localStorage
   */
  function loadConfiguration() {
    const savedConfig = localStorage.getItem("screenshotConfig");

    if (!savedConfig) {
      showError("No saved configuration found");
      return;
    }

    try {
      const config = JSON.parse(savedConfig);

      // Switch to the correct tab if needed
      if (config.isBatchMode) {
        document.querySelector(`[data-tab="multiple-urls"]`).click();

        // Set grouped mode if needed
        if (groupedModeCheckbox) {
          groupedModeCheckbox.checked = config.isGroupedMode || false;
          groupedModeCheckbox.dispatchEvent(new Event("change"));
        }

        if (config.isGroupedMode && config.groups && config.groups.length > 0) {
          // Clear existing groups first (except the first one)
          const existingGroups = document.querySelectorAll(
            ".url-selector-group"
          );
          for (let i = 1; i < existingGroups.length; i++) {
            existingGroups[i].remove();
          }

          // Set values for the first group
          if (existingGroups.length > 0) {
            const firstGroup = existingGroups[0];
            const firstGroupUrl = firstGroup.querySelector(".group-url");
            const firstGroupSelectors =
              firstGroup.querySelector(".group-selectors");

            if (firstGroupUrl && firstGroupSelectors && config.groups[0]) {
              firstGroupUrl.value = config.groups[0].url || "";
              firstGroupSelectors.value = config.groups[0].selectors || "";
            }
          }

          // Add new groups for the rest
          for (let i = 1; i < config.groups.length; i++) {
            addNewGroup();
            const newGroups = document.querySelectorAll(".url-selector-group");
            const lastGroup = newGroups[newGroups.length - 1];

            const groupUrl = lastGroup.querySelector(".group-url");
            const groupSelectors = lastGroup.querySelector(".group-selectors");

            if (groupUrl && groupSelectors) {
              groupUrl.value = config.groups[i].url || "";
              groupSelectors.value = config.groups[i].selectors || "";
            }
          }
        } else {
          // Load regular batch configuration
          if (urlsTextarea) urlsTextarea.value = config.urls || "";
          if (batchSelectorsInput)
            batchSelectorsInput.value = config.batchSelectors || "";
        }
      } else {
        document.querySelector(`[data-tab="single-url"]`).click();
      }

      // Set common values
      urlInput.value = config.url || "";
      selectorsInput.value = config.selectors || "";

      // Set viewport dimensions if they exist in saved config
      if (config.viewportWidth) viewportWidthInput.value = config.viewportWidth;
      if (config.viewportHeight)
        viewportHeightInput.value = config.viewportHeight;
      if (config.waitTime) waitTimeInput.value = config.waitTime;

      hideError();
    } catch (error) {
      showError("Failed to load saved configuration");
      console.error("Error loading configuration:", error);
    }
  }

  /**
   * Handles the screenshot capture process
   */
  async function handleTakeScreenshots() {
    // Get input values
    const url = urlInput.value.trim();
    const selectorsText = selectorsInput.value.trim();
    const viewportWidth = parseInt(viewportWidthInput.value) || 1280;
    const viewportHeight = parseInt(viewportHeightInput.value) || 800;
    const waitTime = parseInt(waitTimeInput.value) || 1000;

    // Validate input
    if (!url) {
      showError("Please enter a valid URL");
      return;
    }

    if (!selectorsText) {
      showError("Please enter at least one CSS selector");
      return;
    }

    // Parse selectors (split by newline and filter empty lines)
    const selectors = selectorsText
      .split("\n")
      .map((selector) => selector.trim())
      .filter((selector) => selector);

    if (selectors.length === 0) {
      showError("Please enter at least one valid CSS selector");
      return;
    }

    // Hide any previous errors and results
    hideError();
    hideResults();

    // Show loading indicator
    showLoading();

    try {
      // Make API request to take screenshots
      const response = await fetch("/api/screenshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          selectors,
          viewport: {
            width: viewportWidth,
            height: viewportHeight,
          },
          waitTime: waitTime,
        }),
      });

      const data = await response.json();

      // Hide loading indicator
      hideLoading();

      if (!response.ok) {
        showError(`Error: ${data.error || "Failed to take screenshots"}`);
        return;
      }

      // Display results
      displayScreenshots(data.screenshots);
    } catch (error) {
      hideLoading();
      showError(`Error: ${error.message}`);
      console.error("Error taking screenshots:", error);
    }
  }

  /**
   * Displays the captured screenshots
   * @param {Array} screenshots - Array of screenshot objects
   */
  function displayScreenshots(screenshots) {
    // Clear previous results
    screenshotsGrid.innerHTML = "";

    if (!screenshots || screenshots.length === 0) {
      screenshotsGrid.innerHTML = "<p>No screenshots were captured.</p>";
      showResults();
      return;
    }

    // Create screenshot items
    screenshots.forEach((screenshot) => {
      if (screenshot.error) {
        // Display error for this screenshot
        const errorItem = document.createElement("div");
        errorItem.className = "screenshot-item screenshot-error-item";

        // Check if this is a "selector not found" type error and suggest alternatives
        let suggestionHtml = "";
        if (screenshot.error.includes("does not exist on the page")) {
          suggestionHtml = `
            <div class="selector-suggestions">
              <p><strong>Suggestions:</strong></p>
              <ul>
                <li>Check for typos in your selector</li>
                <li>Try a more general selector (e.g., use '.header' instead of '.header-section')</li>
                <li>Increase the wait time to allow dynamic content to load</li>
                <li>Use browser developer tools to verify the selector exists</li>
              </ul>
            </div>
          `;
        }

        errorItem.innerHTML = `
          <div class="screenshot-info">
            <div class="screenshot-selector">${escapeHtml(
              screenshot.selector
            )}</div>
            <p class="screenshot-error">Error: ${escapeHtml(
              screenshot.error
            )}</p>
            ${suggestionHtml}
          </div>
        `;
        screenshotsGrid.appendChild(errorItem);
      } else {
        // Display successful screenshot
        const item = document.createElement("div");
        item.className = "screenshot-item";
        item.innerHTML = `
          <img class="screenshot-image" src="${
            screenshot.path
          }" alt="Screenshot of ${escapeHtml(screenshot.selector)}">
          <div class="screenshot-info">
            <div class="screenshot-selector-container">
              <div class="screenshot-selector">${escapeHtml(
                screenshot.selector
              )}</div>
              <button class="copy-btn" data-selector="${escapeHtml(
                screenshot.selector
              )}">Copy</button>
            </div>
            <p class="screenshot-dimensions">
              ${Math.round(screenshot.width)}px × ${Math.round(
          screenshot.height
        )}px
            </p>
            <a href="${
              screenshot.path
            }" download="screenshot_${Date.now()}.png" class="download-btn">Download</a>
          </div>
        `;
        screenshotsGrid.appendChild(item);
      }
    });

    // Add event listeners to copy buttons
    document.querySelectorAll(".copy-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const selector = button.getAttribute("data-selector");
        navigator.clipboard
          .writeText(selector)
          .then(() => {
            // Show temporary feedback
            const originalText = button.textContent;
            button.textContent = "Copied!";
            button.classList.add("copied");

            // Reset after 2 seconds
            setTimeout(() => {
              button.textContent = originalText;
              button.classList.remove("copied");
            }, 2000);
          })
          .catch((err) => {
            console.error("Failed to copy: ", err);
            alert("Failed to copy selector");
          });
      });
    });

    // Show results container
    showResults();
  }

  /**
   * Tests selectors without taking screenshots
   */
  async function handleTestSelectors() {
    // Get input values
    const url = urlInput.value.trim();
    const selectorsText = selectorsInput.value.trim();
    const viewportWidth = parseInt(viewportWidthInput.value) || 1280;
    const viewportHeight = parseInt(viewportHeightInput.value) || 800;
    const waitTime = parseInt(waitTimeInput.value) || 1000;

    // Validate input
    if (!url) {
      showError("Please enter a valid URL");
      return;
    }

    if (!selectorsText) {
      showError("Please enter at least one CSS selector");
      return;
    }

    // Parse selectors (split by newline and filter empty lines)
    const selectors = selectorsText
      .split("\n")
      .map((selector) => selector.trim())
      .filter((selector) => selector);

    if (selectors.length === 0) {
      showError("Please enter at least one valid CSS selector");
      return;
    }

    // Hide any previous errors and results
    hideError();
    hideResults();

    // Show loading indicator
    showLoading();

    try {
      // Make API request to test selectors
      const response = await fetch("/api/test-selectors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          selectors,
          viewport: {
            width: viewportWidth,
            height: viewportHeight,
          },
          waitTime: waitTime,
        }),
      });

      const data = await response.json();

      // Hide loading indicator
      hideLoading();

      if (!response.ok) {
        showError(`Error: ${data.error || "Failed to test selectors"}`);
        return;
      }

      // Display results
      displaySelectorTestResults(data.results);
    } catch (error) {
      hideLoading();
      showError(`Error: ${error.message}`);
      console.error("Error testing selectors:", error);
    }
  }

  /**
   * Displays the selector test results
   * @param {Array} results - Array of selector test results
   */
  function displaySelectorTestResults(results) {
    // Clear previous results
    screenshotsGrid.innerHTML = "";

    if (!results || results.length === 0) {
      screenshotsGrid.innerHTML = "<p>No selectors were tested.</p>";
      showResults();
      return;
    }

    // Create result items
    results.forEach((result) => {
      const resultItem = document.createElement("div");
      resultItem.className = `selector-test-item ${
        result.exists ? "selector-found" : "selector-not-found"
      }`;

      let statusClass = result.exists ? "status-success" : "status-error";
      let statusText = result.exists ? "Found" : "Not Found";

      let detailsHtml = "";
      if (result.exists) {
        detailsHtml = `
          <p>Found <strong>${result.count}</strong> element(s)</p>
          <p>Visible elements: <strong>${result.visibleCount}</strong></p>
          ${
            result.dimensions
              ? `<p>First element size: ${result.dimensions.width}px × ${result.dimensions.height}px</p>`
              : ""
          }
        `;

        // If elements exist but aren't visible, show warning
        if (result.visibleCount === 0) {
          statusClass = "status-warning";
          statusText = "Not Visible";
        }
      }

      resultItem.innerHTML = `
        <div class="selector-test-header">
          <div class="selector-name">${escapeHtml(result.selector)}</div>
          <div class="selector-status ${statusClass}">${statusText}</div>
        </div>
        <div class="selector-test-details">
          ${detailsHtml}
          <p class="selector-message">${escapeHtml(result.message)}</p>
        </div>
      `;

      screenshotsGrid.appendChild(resultItem);
    });

    // Show results container
    showResults();
  }
  /**
   * Handles the batch processing of multiple URLs
   */
  async function handleBatchProcess() {
    // Check if grouped mode is on
    const useGroupedMode = groupedModeCheckbox && groupedModeCheckbox.checked;

    if (useGroupedMode) {
      await handleGroupedBatchProcess();
    } else {
      await handleRegularBatchProcess();
    }
  }

  /**
   * Handles batch processing with URL-selector groups
   */
  async function handleGroupedBatchProcess() {
    // Get all groups
    const groups = document.querySelectorAll(".url-selector-group");
    if (!groups || groups.length === 0) {
      showError("Please add at least one URL-selector group");
      return;
    }

    // Validate each group
    const urlSelectorPairs = [];
    for (const group of groups) {
      const urlInput = group.querySelector(".group-url");
      const selectorsInput = group.querySelector(".group-selectors");

      const url = urlInput.value.trim();
      if (!url) {
        showError("Please enter a URL for each group");
        return;
      }

      const selectorsText = selectorsInput.value.trim();
      if (!selectorsText) {
        showError("Please enter at least one CSS selector for each group");
        return;
      }

      // Parse selectors
      const selectors = selectorsText
        .split("\n")
        .map((selector) => selector.trim())
        .filter((selector) => selector);

      if (selectors.length === 0) {
        showError(
          "Please enter at least one valid CSS selector for each group"
        );
        return;
      }

      urlSelectorPairs.push({ url, selectors });
    }

    // Get viewport and wait time
    const viewportWidth = parseInt(viewportWidthInput.value) || 1280;
    const viewportHeight = parseInt(viewportHeightInput.value) || 800;
    const waitTime = parseInt(waitTimeInput.value) || 1000;

    // Hide any previous errors and results
    hideError();
    hideResults();

    // Show loading indicator
    showLoading();

    try {
      const batchResults = [];

      // Process each URL-selector pair
      for (const { url, selectors } of urlSelectorPairs) {
        try {
          // Make API request for this URL and its selectors
          const response = await fetch("/api/screenshot", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url,
              selectors,
              viewport: {
                width: viewportWidth,
                height: viewportHeight,
              },
              waitTime: waitTime,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            batchResults.push({
              url,
              screenshots: data.screenshots,
              success: true,
            });
          } else {
            batchResults.push({
              url,
              error: data.error || "Failed to take screenshots",
              success: false,
            });
          }
        } catch (error) {
          batchResults.push({
            url,
            error: error.message,
            success: false,
          });
        }
      }

      // Hide loading indicator
      hideLoading();

      // Display batch results
      displayBatchResults(batchResults);

      // Show the Download All button if we have results
      if (batchResults && batchResults.length > 0) {
        downloadAllBtn.style.display = "block";
      }
    } catch (error) {
      hideLoading();
      showError(`Error: ${error.message}`);
      console.error("Error processing grouped batch:", error);
    }
  }

  /**
   * Handles regular batch processing (all URLs with same selectors)
   */
  async function handleRegularBatchProcess() {
    // Get input values
    const urlsText = urlsTextarea.value.trim();
    const selectorsText = batchSelectorsInput.value.trim();
    const viewportWidth = parseInt(viewportWidthInput.value) || 1280;
    const viewportHeight = parseInt(viewportHeightInput.value) || 800;
    const waitTime = parseInt(waitTimeInput.value) || 1000;

    // Validate input
    if (!urlsText) {
      showError("Please enter at least one URL");
      return;
    }

    if (!selectorsText) {
      showError("Please enter at least one CSS selector");
      return;
    }

    // Parse URLs (split by newline and filter empty lines)
    const urls = urlsText
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url);

    if (urls.length === 0) {
      showError("Please enter at least one valid URL");
      return;
    }

    // Parse selectors (split by newline and filter empty lines)
    const selectors = selectorsText
      .split("\n")
      .map((selector) => selector.trim())
      .filter((selector) => selector);

    if (selectors.length === 0) {
      showError("Please enter at least one valid CSS selector");
      return;
    }

    // Hide any previous errors and results
    hideError();
    hideResults();

    // Show loading indicator
    showLoading();

    try {
      // Make API request to process batch
      const response = await fetch("/api/batch-screenshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urls,
          selectors,
          viewport: {
            width: viewportWidth,
            height: viewportHeight,
          },
          waitTime: waitTime,
        }),
      });

      const data = await response.json();

      // Hide loading indicator
      hideLoading();

      if (!response.ok) {
        showError(`Error: ${data.error || "Failed to process batch job"}`);
        return;
      }

      // Display batch results
      displayBatchResults(data.batchResults);

      // Show the Download All button if we have results
      if (data.batchResults && data.batchResults.length > 0) {
        downloadAllBtn.style.display = "block";
      }
    } catch (error) {
      hideLoading();
      showError(`Error: ${error.message}`);
      console.error("Error processing batch:", error);
    }
  }

  /**
   * Displays the results from batch processing
   * @param {Array} batchResults - Array of batch result objects
   */
  function displayBatchResults(batchResults) {
    // Clear previous results
    screenshotsGrid.innerHTML = "";

    if (!batchResults || batchResults.length === 0) {
      screenshotsGrid.innerHTML =
        "<p>No results were returned from batch processing.</p>";
      showResults();
      return;
    }

    // Create a container for each URL's results
    batchResults.forEach((result, index) => {
      const urlContainer = document.createElement("div");
      urlContainer.className = "batch-url-item";

      // Create header for this URL
      const urlHeader = document.createElement("div");
      urlHeader.className = "batch-url-heading";

      let statusHtml = "";
      if (result.success) {
        statusHtml = `<span class="batch-url-status status-success">Success</span>`;
      } else {
        statusHtml = `<span class="batch-url-status status-error">Failed</span>`;
      }

      urlHeader.innerHTML = `
        <h3>URL ${index + 1}: ${escapeHtml(result.url)}</h3>
        ${statusHtml}
      `;

      urlContainer.appendChild(urlHeader);

      // Create screenshot content
      if (
        result.success &&
        result.screenshots &&
        result.screenshots.length > 0
      ) {
        const screenshotsContainer = document.createElement("div");
        screenshotsContainer.className = "screenshots-grid";

        result.screenshots.forEach((screenshot) => {
          if (screenshot.error) {
            // Display error for this screenshot
            const errorItem = document.createElement("div");
            errorItem.className = "screenshot-item screenshot-error-item";
            errorItem.innerHTML = `
              <div class="screenshot-info">
                <div class="screenshot-selector">${escapeHtml(
                  screenshot.selector
                )}</div>
                <p class="screenshot-error">Error: ${escapeHtml(
                  screenshot.error
                )}</p>
              </div>
            `;
            screenshotsContainer.appendChild(errorItem);
          } else {
            // Display successful screenshot
            const item = document.createElement("div");
            item.className = "screenshot-item";
            item.innerHTML = `
              <img class="screenshot-image" src="${
                screenshot.path
              }" alt="Screenshot of ${escapeHtml(screenshot.selector)}">
              <div class="screenshot-info">
                <div class="screenshot-selector-container">
                  <div class="screenshot-selector">${escapeHtml(
                    screenshot.selector
                  )}</div>
                  <button class="copy-btn" data-selector="${escapeHtml(
                    screenshot.selector
                  )}">Copy</button>
                </div>
                <p class="screenshot-dimensions">
                  ${Math.round(screenshot.width)}px × ${Math.round(
              screenshot.height
            )}px
                </p>
                <a href="${
                  screenshot.path
                }" download="screenshot_${Date.now()}.png" class="download-btn">Download</a>
              </div>
            `;
            screenshotsContainer.appendChild(item);
          }
        });

        urlContainer.appendChild(screenshotsContainer);
      } else if (!result.success) {
        // Display error message
        const errorMessage = document.createElement("p");
        errorMessage.className = "screenshot-error";
        errorMessage.textContent = `Error processing this URL: ${
          result.error || "Unknown error"
        }`;
        urlContainer.appendChild(errorMessage);
      } else {
        // No screenshots for this URL
        const noResults = document.createElement("p");
        noResults.textContent = "No screenshots captured for this URL.";
        urlContainer.appendChild(noResults);
      }

      screenshotsGrid.appendChild(urlContainer);
    });

    // Show results container
    showResults();
  }

  /**
   * Handles downloading all screenshots at once
   */
  async function handleDownloadAll() {
    const screenshots = document.querySelectorAll(".screenshot-image");

    if (!screenshots || screenshots.length === 0) {
      showError("No screenshots available to download");
      return;
    }

    // Create a zip file containing all screenshots
    try {
      // Since we're doing client-side zipping, we need to dynamically load JSZip
      if (typeof JSZip === "undefined") {
        // Show loading message
        showError("Preparing download... Please wait.");

        // Create script element to load JSZip
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.onload = () => {
          hideError();
          doZipDownload(screenshots);
        };
        script.onerror = () => {
          showError(
            "Failed to load required libraries for batch download. Please try again or download individually."
          );
        };
        document.head.appendChild(script);
      } else {
        doZipDownload(screenshots);
      }
    } catch (error) {
      showError(`Error preparing downloads: ${error.message}`);
      console.error("Error in batch download:", error);
    }
  }

  /**
   * Creates and downloads a zip file with all screenshots
   * @param {NodeList} screenshots - The collection of screenshot images
   */
  async function doZipDownload(screenshots) {
    try {
      const zip = new JSZip();
      const folder = zip.folder("screenshots");

      // Keep track of how many screenshots we've processed
      let processedCount = 0;
      const totalCount = screenshots.length;

      // Show loading indicator
      showLoading();

      // Convert each image to a blob and add to zip
      const fetchPromises = Array.from(screenshots).map(async (img, index) => {
        try {
          const response = await fetch(img.src);
          const blob = await response.blob();

          // Extract file extension from src
          const extension = img.src.split(".").pop() || "png";

          // Add to zip
          folder.file(`screenshot_${index + 1}.${extension}`, blob);

          // Update progress
          processedCount++;
        } catch (err) {
          console.error(`Error processing image ${index}:`, err);
        }
      });

      // Wait for all fetches to complete
      await Promise.all(fetchPromises);

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = `screenshots_${Date.now()}.zip`;

      // Trigger download and cleanup
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);

      // Hide loading indicator
      hideLoading();
    } catch (error) {
      hideLoading();
      showError(`Error creating zip file: ${error.message}`);
      console.error("Zip creation error:", error);
    }
  }

  // Helper functions
  function showLoading() {
    loadingIndicator.style.display = "block";
  }

  function hideLoading() {
    loadingIndicator.style.display = "none";
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }

  function hideError() {
    errorMessage.style.display = "none";
  }

  function showResults() {
    resultsContainer.style.display = "block";
  }

  function hideResults() {
    resultsContainer.style.display = "none";
  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
