"use client";

/**
 * API service for making requests to the backend
 */

// Take screenshots of specific elements on a webpage
export async function takeScreenshots({ url, selectors, viewport, waitTime }) {
  try {
    const response = await fetch("/api/screenshot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        selectors,
        viewport,
        waitTime,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to take screenshots");
    }

    return await response.json();
  } catch (error) {
    console.error("Error taking screenshots:", error);
    throw error;
  }
}

// Test selectors without taking screenshots
export async function testSelectors({ url, selectors, viewport, waitTime }) {
  try {
    const response = await fetch("/api/test-selectors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        selectors,
        viewport,
        waitTime,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to test selectors");
    }

    return await response.json();
  } catch (error) {
    console.error("Error testing selectors:", error);
    throw error;
  }
}

// Process batch screenshots for multiple URLs
export async function batchScreenshots({
  urls,
  selectors,
  viewport,
  waitTime,
}) {
  try {
    const response = await fetch("/api/batch-screenshot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urls,
        selectors,
        viewport,
        waitTime,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to process batch screenshots");
    }

    return await response.json();
  } catch (error) {
    console.error("Error processing batch screenshots:", error);
    throw error;
  }
}
