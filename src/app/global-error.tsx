'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="mx-auto max-w-md text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">
              Something went wrong!
            </h2>
            <p className="text-muted-foreground mb-4">
              {error.message || 'An unexpected error occurred'}
            </p>
            <Button
              onClick={reset}
              variant="outline"
            >
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
} 