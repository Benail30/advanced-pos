import { Metadata, Viewport } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import MainLayout from '@/components/layouts/main-layout'

const SalesLineChart = dynamic(() => import('@/components/charts').then(mod => mod.SalesLineChart), { ssr: false })
const SalesBarChart = dynamic(() => import('@/components/charts').then(mod => mod.SalesBarChart), { ssr: false })
const SalesPieChart = dynamic(() => import('@/components/charts').then(mod => mod.SalesPieChart), { ssr: false })

export const metadata: Metadata = {
  title: 'Reports',
  description: 'View sales and performance reports',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesLineChart />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesBarChart />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sales Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesPieChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
} 