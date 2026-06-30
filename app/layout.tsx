import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../lib/context/AppContext";
import Header from "../components/nav/Header";
import MobileNav from "../components/nav/MobileNav";
import Footer from "../components/nav/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trendloop — Gen-Z Trends & Discovery Platform",
  description: "Pinterest meets Instagram Explore meets Product Hunt. Discover premium streetwear, gaming setups, room aesthetics, anime collectibles, and fitness trends curated for Gen-Z.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <AppProvider>
          {/* Top Header Navigation */}
          <HeaderWrapper />
          
          {/* Main Content Area */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Global Footer */}
          <FooterWrapper />
          
          {/* Bottom Mobile Navigation */}
          <MobileNavWrapper />
        </AppProvider>
      </body>
    </html>
  );
}

// Client wrappers to support conditional rendering on admin paths
import ClientLayoutWrapper from "./layout-client-wrapper";

function HeaderWrapper() {
  return <ClientLayoutWrapper type="header" />;
}

function MobileNavWrapper() {
  return <ClientLayoutWrapper type="mobilenav" />;
}

function FooterWrapper() {
  return <ClientLayoutWrapper type="footer" />;
}
