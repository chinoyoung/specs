// Screenshot service for Next.js API routes
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

// Ensure screenshots directory exists
const screenshotsDir = path.join(process.cwd(), "public/screenshots");
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
export async function captureScreenshots(
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

          // Take a screenshot of just this element with a white background
          await page.evaluate((selector) => {
            // Get the element and apply a white background temporarily
            const element = document.querySelector(selector);
            if (element) {
              // Store original styles
              const originalBackgroundColor = element.style.backgroundColor;
              const originalBackgroundImage = element.style.backgroundImage;

              // Apply white background
              element.style.backgroundColor = "white";
              element.style.backgroundImage = "none";

              // Return original styles to restore later
              return {
                originalBackgroundColor,
                originalBackgroundImage,
              };
            }
            return null;
          }, selector);

          // Take the screenshot
          await elementHandle.screenshot({
            path: filepath,
            omitBackground: false, // Don't omit background to keep the white background
          });

          // Restore original styles
          await page.evaluate(
            (selector, originalStyles) => {
              if (originalStyles) {
                const element = document.querySelector(selector);
                if (element) {
                  element.style.backgroundColor =
                    originalStyles.originalBackgroundColor;
                  element.style.backgroundImage =
                    originalStyles.originalBackgroundImage;
                }
              }
            },
            selector,
            await page.evaluate((selector) => {
              const element = document.querySelector(selector);
              if (element) {
                return {
                  originalBackgroundColor: element.style.backgroundColor,
                  originalBackgroundImage: element.style.backgroundImage,
                };
              }
              return null;
            }, selector)
          );

          // Get image information if any exists within the element
          const imageInfo = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            const images = element ? element.querySelectorAll("img") : [];

            // Return dimensions for all images found
            const imagesData = [];
            images.forEach((img) => {
              if (img.complete && img.naturalWidth > 0) {
                imagesData.push({
                  src: img.src,
                  renderedWidth: img.width,
                  renderedHeight: img.height,
                  naturalWidth: img.naturalWidth,
                  naturalHeight: img.naturalHeight,
                  aspectRatio: (img.width / img.height).toFixed(2),
                });
              }
            });

            return imagesData.length > 0 ? imagesData : null;
          }, selector);

          // Add result to our array
          results.push({
            selector,
            path: relativePath,
            width: boundingBox.width,
            height: boundingBox.height,
            images: imageInfo,
          });

          console.log(`Screenshot saved: ${filepath}`);
        } else {
          results.push({
            selector,
            error: "Element found but could not be captured",
          });
        }
      } catch (error) {
        console.error(`Error capturing selector "${selector}":`, error);
        results.push({
          selector,
          error: `Failed to capture: ${error.message}`,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error in captureScreenshots:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Tests selectors on a webpage without taking screenshots
 */
export async function testSelectors(
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

    // Set viewport size
    await page.setViewport({
      width: viewport.width || 1280,
      height: viewport.height || 800,
    });

    // Navigate to the page
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for specified time
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // Test selectors on the page
    const results = await page.evaluate((selectors) => {
      return selectors.map((selector) => {
        const elements = document.querySelectorAll(selector);
        const exists = elements.length > 0;

        let visibleCount = 0;
        let dimensions = null;

        if (exists) {
          // Check visibility of each element
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              visibleCount++;

              // Store dimensions of first visible element
              if (!dimensions) {
                dimensions = {
                  width: rect.width,
                  height: rect.height,
                };
              }
            }
          }
        }

        return {
          selector,
          exists,
          count: elements.length,
          visibleCount,
          dimensions,
        };
      });
    }, selectors);

    return results;
  } catch (error) {
    console.error("Error testing selectors:", error);
    throw error;
  } finally {
    await browser.close();
  }
}
