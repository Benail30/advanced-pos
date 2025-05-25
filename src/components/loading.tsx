'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ text = 'Loading...', fullScreen = false }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'py-8'}`}>
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
      <p className="text-gray-600">{text}</p>
    </div>
  );
} 