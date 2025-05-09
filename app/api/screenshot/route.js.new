import { NextResponse } from "next/server";
import { captureScreenshots } from "../../../utils/screenshotService";

/**
 * API route for capturing screenshots of specific elements on a webpage
 */
export async function POST(request) {
  try {
    const { url, selectors, viewport, waitTime } = await request.json();

    if (
      !url ||
      !selectors ||
      !Array.isArray(selectors) ||
      selectors.length === 0
    ) {
      return NextResponse.json(
        { error: "URL and at least one CSS selector are required" },
        { status: 400 }
      );
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

    const screenshots = await captureScreenshots(
      url,
      selectors,
      viewport,
      waitTime
    );

    return NextResponse.json({ 
      success: true, 
      screenshots 
    });
    
  } catch (error) {
    console.error("Error in screenshot API route:", error);
    return NextResponse.json(
      { error: "Failed to process screenshot request", message: error.message },
      { status: 500 }
    );
  }
}
