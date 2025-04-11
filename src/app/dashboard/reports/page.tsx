'use client';

import { useState } from 'react';
import { PowerBIEmbed } from '@/components/power-bi/power-bi-embed';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Package, TrendingUp } from 'lucide-react';

const reports = [
  {
    id: process.env.NEXT_PUBLIC_POWERBI_SALES_REPORT_ID,
    title: 'Sales Analytics',
    description: 'Track revenue, sales trends, and key performance metrics',
    icon: BarChart3,
    value: 'sales',
  },
  {
    id: process.env.NEXT_PUBLIC_POWERBI_CUSTOMERS_REPORT_ID,
    title: 'Customer Insights',
    description: 'Analyze customer behavior and demographics',
    icon: Users,
    value: 'customers',
  },
  {
    id: process.env.NEXT_PUBLIC_POWERBI_INVENTORY_REPORT_ID,
    title: 'Inventory Analytics',
    description: 'Monitor stock levels and inventory turnover',
    icon: Package,
    value: 'inventory',
  },
  {
    id: process.env.NEXT_PUBLIC_POWERBI_TRENDS_REPORT_ID,
    title: 'Business Trends',
    description: 'Visualize long-term business performance trends',
    icon: TrendingUp,
    value: 'trends',
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Business Analytics</h2>
        <p className="text-muted-foreground">
          Interactive reports and analytics to help you make data-driven decisions
        </p>
      </div>

      <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <TabsTrigger
                key={report.value}
                value={report.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{report.title}</span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {reports.map((report) => (
          <TabsContent key={report.value} value={report.value} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <PowerBIEmbed
                  reportId={report.id || ''}
                  height={600}
                  title={report.title}
                  className="rounded-none"
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 