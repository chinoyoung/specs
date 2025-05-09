import "./globals.css";

export const metadata = {
  title: "Screenshot Tool for Web Elements",
  description:
    "Capture screenshots of specific website elements using CSS selectors",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen p-4 md:p-8">
        <div className="container mx-auto max-w-6xl">{children}</div>
      </body>
    </html>
  );
}
