import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PowerBIEmbedProps {
  reportId: string;
  embedUrl: string;
  title: string;
  lastUpdated: string;
}

export function PowerBIEmbed({
  reportId,
  embedUrl,
  title,
  lastUpdated,
}: PowerBIEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/powerbi/token');
        if (!response.ok) {
          throw new Error('Failed to fetch Power BI token');
        }
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Error fetching Power BI token:', error);
        setError('Failed to load dashboard. Please try again later.');
        toast.error('Failed to load Power BI dashboard');
      }
    };

    fetchToken();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load dashboard. Please try again later.');
    toast.error('Failed to load Power BI dashboard');
  };

  if (!token) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
          </div>
        </div>
        <div className="relative aspect-[16/9]">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Dashboard Container */}
      <div className="relative aspect-[16/9]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <iframe
            src={`${embedUrl}?reportId=${reportId}&token=${token}`}
            className="w-full h-full"
            onLoad={handleLoad}
            onError={handleError}
            title={title}
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
} 