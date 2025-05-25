'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </UserProvider>
  );
}