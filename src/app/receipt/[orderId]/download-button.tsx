'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import type { ReceiptData } from './receipt-pdf';

export function DownloadButton({ data }: { data: ReceiptData }) {
  const [state, setState] = useState<'idle' | 'generating' | 'error'>('idle');

  async function handleDownload() {
    setState('generating');
    try {
      const [{ pdf }, { ReceiptDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./receipt-pdf'),
      ]);

      const blob = await pdf(<ReceiptDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${data.orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setState('idle');
    } catch (err) {
      console.error('PDF generation failed:', err);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={state === 'generating'}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full justify-center"
    >
      {state === 'generating' ? (
        <>
          <span className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
          Generating PDF…
        </>
      ) : state === 'error' ? (
        <span className="text-red-500">Failed — try again</span>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download PDF
        </>
      )}
    </button>
  );
}
