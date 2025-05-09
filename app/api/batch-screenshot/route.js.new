import { NextResponse } from "next/server";
import { captureScreenshots } from "../../../utils/screenshotService";

/**
 * API route for batch processing multiple URLs
 */
export async function POST(request) {
  try {
    const { urls, selectors, viewport, waitTime } = await request.json();

    if (
      !urls ||
      !Array.isArray(urls) ||
      urls.length === 0 ||
      !selectors ||
      !Array.isArray(selectors) ||
      selectors.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one URL and one CSS selector are required" },
        { status: 400 }
      );
    }

    console.log(
      `Batch job: Processing ${urls.length} URLs with ${selectors.length} selectors`
    );

    const batchResults = [];

    // Process each URL sequentially
    for (const url of urls) {
      console.log(`Processing URL: ${url}`);
      try {
        const screenshots = await captureScreenshots(
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

    return NextResponse.json({ 
      success: true, 
      batchResults 
    });
    
  } catch (error) {
    console.error("Error in batch-screenshot API route:", error);
    return NextResponse.json(
      { error: "Failed to process batch screenshot request", message: error.message },
      { status: 500 }
    );
  }
}
