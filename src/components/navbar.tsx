import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Package, Users, BarChart, Settings } from 'lucide-react';

/**
 * NAVIGATION MENU ITEMS
 * 
 * These are all the main sections of our POS system that admins can access.
 * Each item has:
 * - label: The text that appears in the navigation
 * - icon: The small picture next to the text
 * - href: The page URL it links to
 * - color: The default color (gray when not selected)
 */
const routes = [
  {
    label: 'Inventory',           // Manage products and stock
    icon: Package,
    href: '/inventory',
    color: 'text-gray-500'
  },
  {
    label: 'Customers',           // Manage customer information
    icon: Users,
    href: '/customers',
    color: 'text-gray-500'
  },
  {
    label: 'Reports & Analytics', // View sales reports and business insights
    icon: BarChart,
    href: '/reports',
    color: 'text-gray-500'
  },
  {
    label: 'Settings',            // Configure system settings
    icon: Settings,
    href: '/settings',
    color: 'text-gray-500'
  }
];

/**
 * MAIN NAVIGATION COMPONENT
 * 
 * This creates the horizontal navigation bar that appears at the top
 * of admin pages. It shows all the main sections of the POS system.
 * 
 * The navigation is smart - it highlights the current page you're on
 * in purple color, while other links stay gray.
 */
export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  // Get the current page URL so we can highlight the active navigation item
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {/* Create a navigation button for each menu item */}
      {routes.map((route) => (
        <Button
          key={route.href}
          variant="ghost"
          className={cn(
            // Hover effects: purple color and light background when mouse hovers
            'hover:text-purple-600 hover:bg-purple-50',
            // Active state: if this is the current page, make it purple
            pathname === route.href ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
          )}
          asChild
        >
          <Link
            href={route.href}
            className="flex items-center gap-2"
          >
            {/* Show the icon */}
            <route.icon className="h-5 w-5" />
            {/* Show the text label */}
            {route.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
} 