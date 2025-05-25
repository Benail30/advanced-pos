'use client';

import { Metadata, Viewport } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StoreSettings } from '@/components/settings/store-settings'
import { UserSettings } from '@/components/settings/user-settings'
import { SystemSettings } from '@/components/settings/system-settings'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import MainLayout from '@/components/layouts/main-layout'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function SettingsPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/api/auth/login?returnTo=/settings')
    } else if (user) {
      // Check if user has admin role
      console.log('User:', user); // Debug log
      setIsAdmin(user.role === 'admin');
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return null
  }

  // Debug log
  console.log('Rendering settings page, isAdmin:', isAdmin);

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        {isAdmin ? (
          // Admin sees all tabs
          <Tabs defaultValue="store" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="store">Store</TabsTrigger>
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            
            <TabsContent value="store">
              <Card>
                <CardHeader>
                  <CardTitle>Store Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <StoreSettings />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="user">
              <Card>
                <CardHeader>
                  <CardTitle>User Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserSettings />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <SystemSettings />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Cashier sees only system tab
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemSettings />
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
} 