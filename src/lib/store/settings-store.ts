import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  // Appearance
  darkMode: boolean
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  density: 'compact' | 'normal' | 'comfortable'
  
  // Notifications
  notifications: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  notificationSound: boolean
  
  // Backup & Security
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  backupTime: string
  twoFactorAuth: boolean
  
  // General
  currency: string
  timezone: string
  dateFormat: string
  language: string
  numberFormat: string
  
  // Actions
  setDarkMode: (value: boolean) => void
  setTheme: (value: 'light' | 'dark' | 'system') => void
  setFontSize: (value: 'small' | 'medium' | 'large') => void
  setDensity: (value: 'compact' | 'normal' | 'comfortable') => void
  setNotifications: (value: boolean) => void
  setEmailNotifications: (value: boolean) => void
  setPushNotifications: (value: boolean) => void
  setNotificationSound: (value: boolean) => void
  setAutoBackup: (value: boolean) => void
  setBackupFrequency: (value: 'daily' | 'weekly' | 'monthly') => void
  setBackupTime: (value: string) => void
  setTwoFactorAuth: (value: boolean) => void
  setCurrency: (value: string) => void
  setTimezone: (value: string) => void
  setDateFormat: (value: string) => void
  setLanguage: (value: string) => void
  setNumberFormat: (value: string) => void
  saveSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Default values
      darkMode: false,
      theme: 'system',
      fontSize: 'medium',
      density: 'normal',
      notifications: false,
      emailNotifications: false,
      pushNotifications: false,
      notificationSound: true,
      autoBackup: false,
      backupFrequency: 'daily',
      backupTime: '00:00',
      twoFactorAuth: false,
      currency: 'USD',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      language: 'en',
      numberFormat: '1,234.56',
      
      // Actions
      setDarkMode: (value) => set({ darkMode: value }),
      setTheme: (value) => set({ theme: value }),
      setFontSize: (value) => set({ fontSize: value }),
      setDensity: (value) => set({ density: value }),
      setNotifications: (value) => set({ notifications: value }),
      setEmailNotifications: (value) => set({ emailNotifications: value }),
      setPushNotifications: (value) => set({ pushNotifications: value }),
      setNotificationSound: (value) => set({ notificationSound: value }),
      setAutoBackup: (value) => set({ autoBackup: value }),
      setBackupFrequency: (value) => set({ backupFrequency: value }),
      setBackupTime: (value) => set({ backupTime: value }),
      setTwoFactorAuth: (value) => set({ twoFactorAuth: value }),
      setCurrency: (value) => set({ currency: value }),
      setTimezone: (value) => set({ timezone: value }),
      setDateFormat: (value) => set({ dateFormat: value }),
      setLanguage: (value) => set({ language: value }),
      setNumberFormat: (value) => set({ numberFormat: value }),
      
      // Save settings to API
      saveSettings: async () => {
        try {
          const settings = get()
          // Here you would typically make an API call to save the settings
          await fetch('/api/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
          })
        } catch (error) {
          console.error('Failed to save settings:', error)
          throw error
        }
      },
    }),
    {
      name: 'settings-storage',
    }
  )
) 