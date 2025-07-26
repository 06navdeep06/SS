import React from 'react'
import { Menu, Camera, Wifi, WifiOff, Activity } from 'lucide-react'
import { useWebSocket } from '../contexts/WebSocketContext'

const Header = ({ onMenuToggle, activeView }) => {
  const { isConnected, stats } = useWebSocket()

  const getViewTitle = (view) => {
    const titles = {
      dashboard: 'Dashboard',
      search: 'Search Screenshots',
      browse: 'Browse Screenshots',
      stats: 'Statistics',
      settings: 'Settings'
    }
    return titles[view] || 'SmartShot'
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Camera className="w-6 h-6 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">SmartShot</h1>
            </div>
            <div className="hidden sm:block text-gray-400">•</div>
            <h2 className="hidden sm:block text-lg font-medium text-gray-700">
              {getViewTitle(activeView)}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">Disconnected</span>
              </>
            )}
          </div>

          {/* Live Stats */}
          {stats && (
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Activity className="w-4 h-4" />
                <span>{stats.totalScreenshots || 0} screenshots</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Watching</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header