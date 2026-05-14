'use client';

import { useState } from 'react';
import { ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

interface PowerBIEmbedProps {
  embedUrl?: string;
  title?: string;
}

export default function PowerBIEmbed({ 
  embedUrl = "https://app.powerbi.com/view?r=eyJrIjoiNDc4MDM4MDctNmE4Yi00ZDhhLWFkMWQtNmU4OTkwNTI2N2YxIiwidCI6IjBjZWFiZGIwLTYzNWQtNDBkZC1hNmI0LTFjMjYwOGVlMDE2MSJ9",
  title = "Power BI Live Dashboard" 
}: PowerBIEmbedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const openInNewTab = () => {
    window.open(embedUrl, '_blank');
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${isFullscreen ? 'fixed inset-4 z-50' : 'relative'}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          {title}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={openInNewTab}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Power BI Dashboard...</p>
          </div>
        </div>
      )}

      {/* Power BI Iframe */}
      <div className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96 md:h-[500px]'} relative`}>
        <iframe
          src={embedUrl}
          frameBorder="0"
          allowFullScreen
          onLoad={handleIframeLoad}
          className="w-full h-full rounded-b-lg"
          title="Power BI Report"
        />
      </div>

      {/* Status bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Real-time data from Advanced POS</span>
          <span>Auto-refreshing</span>
        </div>
      </div>
    </div>
  );
} 