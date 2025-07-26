import React, { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

const defaultSettings = {
  watchPath: '~/Pictures/Screenshots',
  enableOcr: true,
  enableRename: true,
  enableCategorize: true,
  ocrLanguage: 'eng',
  categoryThreshold: 0.3,
  maxFileSize: 10,
  autoStart: false,
  notifications: true,
  dbPath: 'smartshot.db',
  logLevel: 'INFO'
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      // Use default settings if loading fails
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      
      return true
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  const value = {
    settings,
    loading,
    updateSettings,
    saveSettings,
    resetSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}