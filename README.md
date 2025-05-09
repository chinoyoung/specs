# Website Section Screenshot App

This application allows you to take screenshots of specific sections of any website and display them all on a single page.

## Features

- Enter any publicly accessible website URL
- Process multiple URLs in batch mode
- Specify CSS selectors to target specific sections of the page
- Capture screenshots of each selected section
- View all screenshots together on a single page
- Customize viewport dimensions
- Adjust waiting time for websites with dynamic content
- Download individual screenshots
- Download all screenshots in batch as a ZIP file
- Copy CSS selectors to clipboard
- Save and load screenshot configurations
- Test CSS selectors before taking screenshots
- Responsive design

## Technologies Used

- Node.js and Express for the backend
- Puppeteer for browser automation and screenshot capture
- JSZip for batch downloading capabilities
- HTML, CSS, and JavaScript for the frontend

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Start the server:

   ```
   npm start
   ```

   or for development with automatic restarts:

   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Enter a website URL and the CSS selectors for the sections you want to capture

4. (Optional) Configure advanced options like viewport size and wait time

5. Click "Take Screenshots" for single URL mode or "Run Batch Job" for multiple URLs mode

6. View your captured screenshots in the results section

7. You can download individual screenshots using the "Download" button under each image, or download all screenshots as a ZIP file with the "Download All" button

## Batch Processing Mode

The application supports two modes:

1. **Single URL Mode**: Capture screenshots of specific sections from a single website
2. **Multiple URLs Mode**: Process multiple websites in a batch, applying the same set of CSS selectors to each site

To use the batch processing mode:

1. Click on the "Multiple URLs" tab
2. Enter each URL on a separate line in the text area
3. Enter your CSS selectors
4. Click "Run Batch Job"
5. The results will be grouped by URL, showing all captured sections for each website
6. Use the "Download All" button to receive a ZIP file with all screenshots

## URL-Selector Grouping

The application now supports two modes for batch processing:

1. **Common Selectors Mode**: All URLs are processed with the same set of selectors.
2. **Grouped Mode**: Each URL is paired with its own specific selectors.

The grouped mode is particularly useful when:

- Different websites have different structures requiring different selectors
- You want to capture different sections from different sites
- You want to avoid errors from checking selectors that don't exist on certain pages

To use the grouped mode:

1. Switch to the "Multiple URLs" tab
2. Make sure "Use grouped URL-selector pairs" is checked
3. For each URL, enter its specific selectors that apply only to that site
4. Add more URL-selector groups as needed with the "Add URL Group" button
5. Click "Run Batch Job" to process all groups

## Advanced Options

- **Viewport Width/Height**: Set the browser viewport dimensions (defaults to 1280x800)
- **Wait Time**: Time in milliseconds to wait after page load before capturing screenshots (useful for sites with animations or dynamic content)

## CSS Selector Examples

- `.header` - Selects elements with the class "header"
- `#main-content` - Selects the element with ID "main-content"
- `nav.primary` - Selects nav elements with the class "primary"
- `.product-card img` - Selects images inside elements with the class "product-card"

## License

ISC
