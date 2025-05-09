import { NextResponse } from "next/server";
import { testSelectors } from "../../../utils/screenshotService";

/**
 * API route for testing CSS selectors on a webpage
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

    console.log(`Testing selectors on ${url}: ${selectors.join(", ")}`);

    const results = await testSelectors(
      url,
      selectors,
      viewport,
      waitTime
    );

    return NextResponse.json({ 
      success: true, 
      results 
    });
    
  } catch (error) {
    console.error("Error in test-selectors API route:", error);
    return NextResponse.json(
      { error: "Failed to test selectors", message: error.message },
      { status: 500 }
    );
  }
}
