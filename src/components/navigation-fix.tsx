'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function NavigationFix() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Check if we're at the "not found" page
    if (pathname === '/404' || document.title.includes('Not Found')) {
      // Try redirecting to the same path but on port 3001 if we're on 3000
      const currentUrl = window.location.href;
      if (currentUrl.includes(':3000/')) {
        const newUrl = currentUrl.replace(':3000/', ':3001/');
        window.location.href = newUrl;
      } else if (!currentUrl.includes(':3001/')) {
        // If we're not already on 3001, try the home page on 3001
        window.location.href = 'http://localhost:3001/';
      } else {
        // If we're already on 3001, try the POS page
        router.push('/pos');
      }
    }
  }, [pathname, router]);
  
  return null;
} 