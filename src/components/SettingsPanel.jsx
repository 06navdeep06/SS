import React, { useState } from 'react'
import { Settings, Folder, Eye, FileText, Tag, Save, RefreshCw, AlertCircle } from 'lucide-react'
import { useSettings } from '../contexts/SettingsContext'

const SettingsPanel = () => {
  const { settings, updateSettings, saveSettings } = useSettings()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSettings()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      updateSettings({
        watchPath: '~/Pictures/Screenshots',
        enableOcr: true,
        enableRename: true,
        enableCategorize: true,
        ocrLanguage: 'eng',
        categoryThreshold: 0.3,
        maxFileSize: 10,
        autoStart: false,
        notifications: true
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : saved ? (
              <AlertCircle className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Folder className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Watch Directory
            </label>
            <input
              type="text"
              value={settings.watchPath}
              onChange={(e) => updateSettings({ watchPath: e.target.value })}
              className="input-field"
              placeholder="~/Pictures/Screenshots"
            />
            <p className="text-xs text-gray-500 mt-1">
              Directory to monitor for new screenshots
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum File Size (MB)
            </label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => updateSettings({ maxFileSize: parseInt(e.target.value) })}
              className="input-field"
              min="1"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Skip files larger than this size
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoStart"
              checked={settings.autoStart}
              onChange={(e) => updateSettings({ autoStart: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="autoStart" className="text-sm font-medium text-gray-700">
              Start watcher automatically when app launches
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="notifications"
              checked={settings.notifications}
              onChange={(e) => updateSettings({ notifications: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
              Show desktop notifications for new screenshots
            </label>
          </div>
        </div>
      </div>

      {/* OCR Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <FileText className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">OCR Settings</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableOcr"
              checked={settings.enableOcr}
              onChange={(e) => updateSettings({ enableOcr: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="enableOcr" className="text-sm font-medium text-gray-700">
              Enable OCR text extraction
            </label>
          </div>

          {settings.enableOcr && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OCR Language
                </label>
                <select
                  value={settings.ocrLanguage}
                  onChange={(e) => updateSettings({ ocrLanguage: e.target.value })}
                  className="input-field"
                >
                  <option value="eng">English</option>
                  <option value="spa">Spanish</option>
                  <option value="fra">French</option>
                  <option value="deu">German</option>
                  <option value="chi_sim">Chinese (Simplified)</option>
                  <option value="jpn">Japanese</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Language for text recognition (requires Tesseract language packs)
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableRename"
                  checked={settings.enableRename}
                  onChange={(e) => updateSettings({ enableRename: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="enableRename" className="text-sm font-medium text-gray-700">
                  Auto-rename files based on OCR content
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Categorization Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Tag className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Categorization Settings</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableCategorize"
              checked={settings.enableCategorize}
              onChange={(e) => updateSettings({ enableCategorize: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="enableCategorize" className="text-sm font-medium text-gray-700">
              Enable automatic categorization
            </label>
          </div>

          {settings.enableCategorize && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Confidence Threshold
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={settings.categoryThreshold}
                  onChange={(e) => updateSettings({ categoryThreshold: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Less strict (0.1)</span>
                  <span>Current: {settings.categoryThreshold}</span>
                  <span>More strict (0.9)</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Higher values require more confidence before categorizing
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Code', 'Errors', 'Tutorials', 'Chats', 'Documents', 'Media'].map(category => (
                    <div key={category} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{category}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Screenshots are automatically sorted into these categories
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Advanced Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Database Path
            </label>
            <input
              type="text"
              value={settings.dbPath || 'smartshot.db'}
              onChange={(e) => updateSettings({ dbPath: e.target.value })}
              className="input-field"
              placeholder="smartshot.db"
            />
            <p className="text-xs text-gray-500 mt-1">
              SQLite database file location
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log Level
            </label>
            <select
              value={settings.logLevel || 'INFO'}
              onChange={(e) => updateSettings({ logLevel: e.target.value })}
              className="input-field"
            >
              <option value="DEBUG">Debug</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Logging verbosity level
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Advanced Settings Warning
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Changing these settings may affect application performance or stability. 
                  Only modify if you understand the implications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel