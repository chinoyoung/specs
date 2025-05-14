import "./globals.css";
import EnvironmentInfo from "../components/EnvironmentInfo";
import { AuthContextProvider } from "../utils/authContext";

export const metadata = {
  title: "GoShotBroad Dashboard",
  description:
    "Advanced screenshot tool for capturing and analyzing web elements",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-dark-50 min-h-screen">
        <AuthContextProvider>
          <div className="min-h-screen transition-all duration-300">
            {children}
          </div>
          <EnvironmentInfo />
        </AuthContextProvider>
      </body>
    </html>
  );
}
