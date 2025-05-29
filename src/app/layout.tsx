import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Toaster } from "@/components/ui/toaster";
import ConditionalNavbar from "@/components/pos/conditional-navbar";

/**
 * FONT SETUP
 * 
 * We use the Inter font from Google Fonts for our entire app.
 * Inter is a clean, modern font that's easy to read on screens.
 */
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
        <UserProvider>
          <div className="min-h-screen flex flex-col">
            {/* 
              NAVIGATION BAR
              This bar appears on most pages but hides on login pages and POS pages
            */}
            <ConditionalNavbar />
            
            {/* 
              PAGE CONTENT
              This is where each individual page's content will appear
            */}
            <main className="flex-1">
              {children}
            </main>
          </div>
          
          {/* 
            TOAST NOTIFICATIONS
            These show success/error messages to users (like "Item added to cart!")
          */}
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
