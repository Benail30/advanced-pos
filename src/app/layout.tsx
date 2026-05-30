import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import ConditionalNavbar from "@/components/pos/conditional-navbar";

const inter = Inter({ subsets: ["latin"] });

/**
 * PAGE METADATA
 *
 * This information appears in the browser tab and when people share
 * links to our website on social media.
 */
export const metadata: Metadata = {
  title: "Advanced POS System",
  description: "A modern point of sale system",
};

/**
 * ROOT LAYOUT COMPONENT
 *
 * This is like the "wrapper" for our entire app. Every page will have:
 * 1. The Inter font applied
 * 2. Access to user authentication (login/logout)
 * 3. A navigation bar (that shows/hides depending on the page)
 * 4. Toast notifications for user feedback
 *
 * Think of this as the "frame" that goes around every page.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 
          USER AUTHENTICATION WRAPPER
          This gives every page access to login/logout functionality
        */}
        <Providers>
          <div className="min-h-screen flex flex-col">
            <ConditionalNavbar />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
