import React, { useState, useEffect } from 'react'
import { Camera, Search, Settings, BarChart3, FolderOpen, Zap } from 'lucide-react'
import Dashboard from './components/Dashboard'
import SearchInterface from './components/SearchInterface'
import SettingsPanel from './components/SettingsPanel'
import StatsView from './components/StatsView'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { SettingsProvider } from './contexts/SettingsContext'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'browse', label: 'Browse', icon: FolderOpen },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'search':
      case 'browse':
        return <SearchInterface />
      case 'stats':
        return <StatsView />
      case 'settings':
        return <SettingsPanel />
      default:
        return <Dashboard />
    }
  }

  return (
    <SettingsProvider>
      <WebSocketProvider>
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar
            items={navigationItems}
            activeView={activeView}
            onViewChange={setActiveView}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          
          <div className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-16'
          }`}>
            <Header
              onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
              activeView={activeView}
            />
            
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                {renderActiveView()}
              </div>
            </main>
          </div>
        </div>
      </WebSocketProvider>
    </SettingsProvider>
  )
}

export default App