# Screenshot Tool

A modern Next.js web application for capturing screenshots of specific elements on websites using CSS selectors.

## Features

- **Ad Components Tool**: Specifically designed for capturing advertising components organized by category.
- **General Screenshot Tool**: Capture any webpage elements by providing CSS selectors.
- **Selector Testing**: Test your CSS selectors before capturing screenshots.
- **Batch Processing**: Capture screenshots from multiple URLs at once.
- **Customization**: Configure viewport size and wait time for dynamic content.
- **Configuration Management**: Save and load your configurations for repeated use.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Download Options**: Download individual screenshots or all screenshots as a ZIP file.
- **PDF Export**: Generate detailed PDF reports with screenshots and image analysis.
- **Image Analysis**: Detect and warn about stretched images in your designs.
- **White Background**: Screenshots include white backgrounds for consistent appearance.
- **Category-Specific URLs**: Configure different URLs for each ad category.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone this repository
2. Install dependencies:

```
npm install
```

3. Create a `.env.local` file in the root directory with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> Note: You need to set up Firebase authentication with Email/Password and Google Sign-In methods enabled in the Firebase console. Also, ensure your Google Sign-In is configured to restrict to @goabroad.com domain.

### Running the Application

To start the application:

```
npm run dev
```

This will start the Next.js app at http://localhost:3000 (or another available port if 3000 is in use)

## Usage

### Ad Components Tool

1. Navigate to the "Ad Components" page
2. Enter the URL of the website you want to capture screenshots from
3. Select an ad category or manually enter selectors for specific ad components
4. Configure viewport size and wait time if needed
5. Click "Capture Screenshots"
6. View and download your screenshots organized by category

### General Screenshot Tool

1. Navigate to the "General Screenshot Tool" page
2. Choose between "Single URL" or "Batch Mode"
3. Enter the URL(s) and CSS selector(s)
4. Configure viewport size and wait time
5. Click "Capture Screenshots" or "Process Batch"
6. View and download your screenshots

### Testing Selectors

1. On the General Screenshot Tool page, click "Test Selectors"
2. The tool will check if your selectors match any elements on the page
3. Review the results to see which selectors work properly

## Technical Details

This application is built using:

- **Next.js**: For the frontend and API routes
- **Tailwind CSS**: For styling and responsive design
- **Puppeteer**: For browser automation and screenshot capture
- **React**: For building the user interface components
- **Firebase**: For authentication and user management

## Authentication

The application uses Firebase Authentication to secure access to the screenshot tool. Only users with @goabroad.com email addresses are allowed to sign in.

### Authentication Features

- **Email/Password Authentication**: Create an account and sign in with your @goabroad.com email address
- **Google Sign-In**: Sign in directly with your Google account (restricted to @goabroad.com domain)
- **Domain Restriction**: Only allows users with @goabroad.com email addresses
- **Protected Routes**: All application pages require authentication
- **User Profile**: User information is displayed in the sidebar and header

### Firebase Configuration

To set up Firebase authentication:

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password and Google authentication methods
3. For Google authentication, configure domain restriction to goabroad.com
4. Update your `.env.local` file with the Firebase project credentials
5. Make sure to implement proper security rules in Firebase console

## Project Structure

```
/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes for screenshots & selector testing
│   ├── ad-components/        # Ad components page
│   ├── general-screenshots/  # General screenshot tool
│   └── about/                # About page
├── components/               # Reusable React components
├── public/                   # Static assets and screenshots
├── utils/                    # Utility functions
│   ├── api.js                # API client functions
│   ├── screenshotService.js  # Screenshot service using Puppeteer
│   ├── storage.js            # Local storage utilities
│   └── specs/                # Ad specifications
```

## Troubleshooting

- **Screenshots not capturing properly**: Ensure that the selectors are correct and that the elements are visible in the viewport.
- **Slow screenshot processing**: Consider reducing the number of selectors or adjusting the wait time.
- **Puppeteer issues**: Make sure you have the necessary dependencies for Puppeteer installed on your system.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.
