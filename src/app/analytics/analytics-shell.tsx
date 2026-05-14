'use client';

import { useState } from 'react';
import { BarChart3, LineChart, ExternalLink, Settings2 } from 'lucide-react';
import { AnalyticsCharts, TrendPoint, CashierStat, ProductStat } from './analytics-charts';
import { cn } from '@/lib/utils';

type Props = {
  trend: TrendPoint[];
  cashiers: CashierStat[];
  products: ProductStat[];
  metabaseEmbedUrl: string | null;  // null = not fully configured
  metabaseSiteUrl: string | null;   // non-null = container is running
};

type Tab = 'charts' | 'metabase';

export function AnalyticsShell({ trend, cashiers, products, metabaseEmbedUrl, metabaseSiteUrl }: Props) {
  const [tab, setTab] = useState<Tab>('charts');

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 border-b border-gray-200">
        <TabBtn active={tab === 'charts'} onClick={() => setTab('charts')}>
          <LineChart className="h-3.5 w-3.5 mr-1.5" />
          Native Charts
        </TabBtn>
        <TabBtn active={tab === 'metabase'} onClick={() => setTab('metabase')}>
          <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
          Metabase BI
          {!metabaseEmbedUrl && (
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-normal">
              setup
            </span>
          )}
        </TabBtn>
        {metabaseSiteUrl && (
          <a
            href={metabaseSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 pb-2 pr-1 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open Metabase
          </a>
        )}
      </div>

      {/* Native charts */}
      {tab === 'charts' && (
        <AnalyticsCharts trend={trend} cashiers={cashiers} products={products} />
      )}

      {/* Metabase embed */}
      {tab === 'metabase' && metabaseEmbedUrl && (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
          <iframe
            src={metabaseEmbedUrl}
            frameBorder="0"
            width="100%"
            height="900"
            allowTransparency
            title="Metabase Dashboard"
          />
        </div>
      )}

      {/* Setup guide — shown when Metabase tab is active but embed not yet ready */}
      {tab === 'metabase' && !metabaseEmbedUrl && (
        <SetupGuide siteUrl={metabaseSiteUrl} />
      )}
    </div>
  );
}

function TabBtn({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
        active
          ? 'border-blue-600 text-blue-700'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
      )}
    >
      {children}
    </button>
  );
}

function SetupGuide({ siteUrl }: { siteUrl: string | null }) {
  const steps = siteUrl
    ? [
        { n: 1, text: 'Open Metabase and finish the setup wizard.', link: siteUrl },
        { n: 2, text: 'Add your database: host=postgres  port=5432  db=pos_db  user=postgres  pass=postgres' },
        { n: 3, text: 'Go to Admin → Settings → Embedding → Enable embedding → copy the Secret key into METABASE_SECRET_KEY in .env.local.' },
        { n: 4, text: 'Create a dashboard, then get its numeric ID from the URL (/dashboard/1) and set METABASE_DASHBOARD_ID in .env.local.' },
        { n: 5, text: 'Restart the Next.js dev server to pick up the new env vars.' },
      ]
    : [
        { n: 1, text: 'Start Metabase: run  docker compose up -d metabase  in the project root.' },
        { n: 2, text: 'Open http://localhost:4000 and finish the setup wizard.' },
        { n: 3, text: 'Add your database: host=postgres  port=5432  db=pos_db  user=postgres  pass=postgres' },
        { n: 4, text: 'Admin → Settings → Embedding → Enable embedding → copy the Secret key into METABASE_SECRET_KEY in .env.local.' },
        { n: 5, text: 'Create a dashboard, get its numeric ID from the URL, set METABASE_DASHBOARD_ID in .env.local.' },
        { n: 6, text: 'Restart the Next.js dev server.' },
      ];

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-50 rounded-xl">
          <Settings2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Connect Metabase</p>
          <p className="text-sm text-gray-500">Follow these steps to enable embedded dashboards.</p>
        </div>
      </div>

      <ol className="space-y-3">
        {steps.map(({ n, text, link }) => (
          <li key={n} className="flex gap-3 text-sm">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
              {n}
            </span>
            <span className="text-gray-700 font-mono text-xs leading-relaxed">
              {link ? (
                <>
                  {text.split('.')[0]}.{' '}
                  <a href={link} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    Open Metabase <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              ) : text}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 font-mono">
        <p className="font-semibold text-gray-600 mb-1">Required env vars (.env.local)</p>
        <p>METABASE_SITE_URL=http://localhost:4000</p>
        <p>METABASE_SECRET_KEY=&lt;from Metabase Admin&gt;</p>
        <p>METABASE_DASHBOARD_ID=1</p>
      </div>
    </div>
  );
}
