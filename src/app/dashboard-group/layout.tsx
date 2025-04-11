import type { Metadata } from "next";
import MainLayout from "@/components/layouts/main-layout";

export const metadata: Metadata = {
  title: "Dashboard | Advanced POS",
  description: "Dashboard for the Advanced POS system",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
} 