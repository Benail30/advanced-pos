"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navSections = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Inventory", href: "/inventory", icon: Package, exact: false },
      { label: "Orders", href: "/orders", icon: ShoppingCart, exact: false },
      { label: "Users", href: "/users", icon: Users, exact: false },
      { label: "Stores", href: "/stores", icon: Store, exact: false },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/settings", icon: Settings, exact: false },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 fixed h-screen bg-white border-r flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <Store className="h-5 w-5 text-blue-600 shrink-0" />
          <span className="font-semibold text-gray-900 truncate">
            Admin Panel
          </span>
        </Link>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ label, href, icon: Icon, exact }) => {
                const isActive = exact
                  ? pathname === href
                  : pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4 mr-2 shrink-0" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
