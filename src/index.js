const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const screenshotService = require("./screenshotService");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.post("/api/screenshot", async (req, res) => {
  try {
    const { url, selectors, viewport, waitTime } = req.body;

    if (
      !url ||
      !selectors ||
      !Array.isArray(selectors) ||
      selectors.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "URL and at least one CSS selector are required" });
    }

    console.log(
      `Taking screenshots of ${url} with selectors: ${selectors.join(", ")}`
    );
    console.log(
      `Using viewport: ${
        viewport ? viewport.width + "x" + viewport.height : "default"
      }`
    );
    console.log(`Wait time: ${waitTime || 1000}ms`);

    const screenshots = await screenshotService.captureScreenshots(
      url,
      selectors,
      viewport,
      waitTime
    );

    return res.status(200).json({ success: true, screenshots });
  } catch (error) {
    console.error("Error taking screenshots:", error);
    return res
      .status(500)
      .json({ error: "Failed to take screenshots", message: error.message });
  }
});

// Route for batch processing multiple URLs
app.post("/api/batch-screenshot", async (req, res) => {
  try {
    const { urls, selectors, viewport, waitTime } = req.body;

    if (
      !urls ||
      !Array.isArray(urls) ||
      urls.length === 0 ||
      !selectors ||
      !Array.isArray(selectors) ||
      selectors.length === 0
    ) {
      return res.status(400).json({
        error: "At least one URL and one CSS selector are required",
      });
    }

    console.log(
      `Batch job: Processing ${urls.length} URLs with ${selectors.length} selectors`
    );

    const batchResults = [];

    // Process each URL sequentially
    for (const url of urls) {
      console.log(`Processing URL: ${url}`);
      try {
        const screenshots = await screenshotService.captureScreenshots(
          url,
          selectors,
          viewport,
          waitTime
        );

        batchResults.push({
          url,
          screenshots,
          success: true,
        });
      } catch (error) {
        console.error(`Error processing URL ${url}:`, error);
        batchResults.push({
          url,
          error: error.message,
          success: false,
        });
      }
    }

    return res.status(200).json({ success: true, batchResults });
  } catch (error) {
    console.error("Error in batch processing:", error);
    return res
      .status(500)
      .json({ error: "Failed to process batch job", message: error.message });
  }
});

// Route to test selectors without taking screenshots
app.post("/api/test-selectors", async (req, res) => {
  try {
    const { url, selectors, viewport, waitTime } = req.body;

    if (
      !url ||
      !selectors ||
      !Array.isArray(selectors) ||
      selectors.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "URL and at least one CSS selector are required" });
    }

    console.log(`Testing selectors on ${url}: ${selectors.join(", ")}`);

    const results = await screenshotService.testSelectors(
      url,
      selectors,
      viewport,
      waitTime
    );

    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Error testing selectors:", error);
    return res
      .status(500)
      .json({ error: "Failed to test selectors", message: error.message });
  }
});

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
