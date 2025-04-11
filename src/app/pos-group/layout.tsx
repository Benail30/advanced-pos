import React from 'react';
import Navbar from '@/components/pos/navbar';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "POS | Advanced POS",
  description: "Point of Sale interface for the Advanced POS system",
};

export default function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
} 