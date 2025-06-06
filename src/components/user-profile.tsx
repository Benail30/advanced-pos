'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Shield, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export function UserProfile() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <Button variant="outline" asChild>
        <Link href="/api/auth/login">Sign In</Link>
      </Button>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const userRoles = user['https://advanced-pos.com/roles'] as string[] || [];
  const isAdmin = userRoles.some(role => role.toLowerCase() === 'admin');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.picture || undefined} alt={user.name || 'User avatar'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white flex items-center justify-center">
            {isAdmin ? (
              <Shield className="h-3 w-3 text-primary" />
            ) : (
              <ShoppingCart className="h-3 w-3 text-muted-foreground" />
            )}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {isAdmin ? (
                <Shield className="h-3 w-3 text-primary" />
              ) : (
                <ShoppingCart className="h-3 w-3 text-muted-foreground" />
              )}
              <p className="text-xs leading-none text-muted-foreground">
                {isAdmin ? 'Administrator' : 'Cashier'}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/inventory">Inventory</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">Settings</Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/pos">Point of Sale</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/api/auth/logout">Sign Out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 