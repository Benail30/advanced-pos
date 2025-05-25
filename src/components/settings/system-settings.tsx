'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettingsStore } from '@/lib/store/settings-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

export function SystemSettings() {
  const {
    // Appearance
    darkMode,
    theme,
    fontSize,
    density,
    setDarkMode,
    setTheme,
    setFontSize,
    setDensity,
    
    // Notifications
    notifications,
    emailNotifications,
    pushNotifications,
    notificationSound,
    setNotifications,
    setEmailNotifications,
    setPushNotifications,
    setNotificationSound,
    
    // Backup & Security
    autoBackup,
    backupFrequency,
    backupTime,
    twoFactorAuth,
    setAutoBackup,
    setBackupFrequency,
    setBackupTime,
    setTwoFactorAuth,
    
    // General
    currency,
    timezone,
    dateFormat,
    language,
    numberFormat,
    setCurrency,
    setTimezone,
    setDateFormat,
    setLanguage,
    setNumberFormat,
    
    saveSettings,
  } = useSettingsStore()

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveSettings()
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark theme
              </p>
            </div>
            <Switch
              id="darkMode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontSize">Font Size</Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="density">Density</Label>
            <Select value={density} onValueChange={setDensity}>
              <SelectTrigger>
                <SelectValue placeholder="Select density" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for important updates
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              disabled={!notifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications
              </p>
            </div>
            <Switch
              id="pushNotifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
              disabled={!notifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notificationSound">Notification Sound</Label>
              <p className="text-sm text-muted-foreground">
                Play sound for notifications
              </p>
            </div>
            <Switch
              id="notificationSound"
              checked={notificationSound}
              onCheckedChange={setNotificationSound}
              disabled={!notifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup & Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoBackup">Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">
                Enable automatic backups of your data
              </p>
            </div>
            <Switch
              id="autoBackup"
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backupFrequency">Backup Frequency</Label>
            <Select value={backupFrequency} onValueChange={setBackupFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backupTime">Backup Time</Label>
            <Input
              type="time"
              id="backupTime"
              value={backupTime}
              onChange={(e) => setBackupTime(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Enable two-factor authentication for additional security
              </p>
            </div>
            <Switch
              id="twoFactorAuth"
              checked={twoFactorAuth}
              onCheckedChange={setTwoFactorAuth}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
                <SelectItem value="CAD">CAD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                <SelectItem value="CST">Central Time (CST)</SelectItem>
                <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberFormat">Number Format</Label>
            <Select value={numberFormat} onValueChange={setNumberFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select number format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1,234.56">1,234.56</SelectItem>
                <SelectItem value="1.234,56">1.234,56</SelectItem>
                <SelectItem value="1 234,56">1 234,56</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
} 