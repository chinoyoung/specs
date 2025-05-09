const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, "../public/screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Captures screenshots of specific elements in a webpage
 * @param {string} url - The URL of the website to screenshot
 * @param {string[]} selectors - CSS selectors of elements to screenshot
 * @param {Object} viewport - The viewport dimensions
 * @param {number} waitTime - Time to wait after page load before taking screenshots (ms)
 * @returns {Promise<Array>} - Array of screenshot information
 */
async function captureScreenshots(
  url,
  selectors,
  viewport = { width: 1280, height: 800 },
  waitTime = 1000
) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set viewport size from parameters
    await page.setViewport({
      width: viewport.width || 1280,
      height: viewport.height || 800,
    });

    // Navigate to the page
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: "networkidle2" });

    // Allow custom time for any client-side rendering
    console.log(`Waiting for ${waitTime}ms`);
    // Use setTimeout instead of page.waitForTimeout which might not be available in some Puppeteer versions
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    const results = [];

    // Check if selectors exist on page
    const selectorPresenceCheck = await page.evaluate((selectors) => {
      return selectors.map((selector) => {
        const elements = document.querySelectorAll(selector);
        return {
          selector,
          present: elements.length > 0,
          count: elements.length,
        };
      });
    }, selectors);

    console.log(
      "Selector presence check:",
      JSON.stringify(selectorPresenceCheck, null, 2)
    );

    // Take screenshots of each selector
    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];

      try {
        // Wait for the element to be available with increased timeout
        console.log(`Looking for selector: ${selector}`);
        await page.waitForSelector(selector, { timeout: 10000 });

        // Get the element handle
        const elementHandle = await page.$(selector);

        if (elementHandle) {
          // Generate a unique filename
          const timestamp = Date.now();
          const filename = `screenshot_${i}_${timestamp}.png`;
          const filepath = path.join(screenshotsDir, filename);
          const relativePath = `/screenshots/${filename}`;

          // Get the bounding box of the element
          const boundingBox = await elementHandle.boundingBox();

          // Take a screenshot of just this element
          await elementHandle.screenshot({
            path: filepath,
            omitBackground: true,
          });

          // Add result to our array
          results.push({
            selector,
            path: relativePath,
            width: boundingBox.width,
            height: boundingBox.height,
          });

          console.log(`Screenshot taken for selector: ${selector}`);
        } else {
          console.log(`Element not found for selector: ${selector}`);
        }
      } catch (error) {
        console.error(
          `Error capturing screenshot for selector ${selector}:`,
          error
        );

        // Get a more helpful error message
        let errorMessage = error.message;
        if (error.message.includes("failed: Waiting failed")) {
          // Check if the selector exists but is not visible/ready
          const presenceCheck = await page.evaluate((sel) => {
            const elements = document.querySelectorAll(sel);
            return {
              exists: elements.length > 0,
              count: elements.length,
              isVisible:
                elements.length > 0
                  ? Array.from(elements).some((el) => {
                      const rect = el.getBoundingClientRect();
                      return rect.width > 0 && rect.height > 0;
                    })
                  : false,
            };
          }, selector);

          if (presenceCheck.exists) {
            if (!presenceCheck.isVisible) {
              errorMessage = `Found ${presenceCheck.count} elements with selector '${selector}', but none are visible. The element may be hidden or have zero dimensions.`;
            } else {
              errorMessage = `Found ${presenceCheck.count} elements with selector '${selector}', but they might not be fully loaded or rendered.`;
            }
          } else {
            errorMessage = `Selector '${selector}' does not exist on the page. Please check your selector for typos or wait longer for dynamic content to load.`;
          }
        }

        results.push({
          selector,
          error: errorMessage,
        });
      }
    }

    return results;
  } finally {
    await browser.close();
  }
}

/**
 * Tests if selectors exist on a webpage without taking screenshots
 * @param {string} url - The URL of the website to test
 * @param {string[]} selectors - CSS selectors to test
 * @param {Object} viewport - The viewport dimensions
 * @param {number} waitTime - Time to wait after page load before testing (ms)
 * @returns {Promise<Array>} - Array of selector test results
 */
async function testSelectors(
  url,
  selectors,
  viewport = { width: 1280, height: 800 },
  waitTime = 1000
) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set viewport size from parameters
    await page.setViewport({
      width: viewport.width || 1280,
      height: viewport.height || 800,
    });

    // Navigate to the page
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for the specified time
    console.log(`Waiting for ${waitTime}ms`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // Test each selector
    const results = await page.evaluate((selectorsToTest) => {
      return selectorsToTest.map((selector) => {
        try {
          const elements = document.querySelectorAll(selector);

          if (elements.length === 0) {
            return {
              selector,
              exists: false,
              count: 0,
              message: `Selector not found on page`,
            };
          }

          // Check if elements are visible
          const visibleElements = Array.from(elements).filter((el) => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;
            const style = window.getComputedStyle(el);
            const isDisplayed =
              style.display !== "none" && style.visibility !== "hidden";
            return isVisible && isDisplayed;
          });

          return {
            selector,
            exists: true,
            count: elements.length,
            visibleCount: visibleElements.length,
            dimensions:
              visibleElements.length > 0
                ? {
                    width: Math.round(
                      visibleElements[0].getBoundingClientRect().width
                    ),
                    height: Math.round(
                      visibleElements[0].getBoundingClientRect().height
                    ),
                  }
                : null,
            message:
              elements.length > 0
                ? `Found ${elements.length} element(s), ${visibleElements.length} visible`
                : "No elements found",
          };
        } catch (error) {
          return {
            selector,
            exists: false,
            error: error.toString(),
            message: `Error testing selector: ${error.toString()}`,
          };
        }
      });
    }, selectors);

    return results;
  } finally {
    await browser.close();
  }
}

module.exports = {
  captureScreenshots,
  testSelectors,
};
