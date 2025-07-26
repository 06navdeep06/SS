import React, { useState, useEffect } from 'react'
import { 
  Camera, 
  Eye, 
  FolderOpen, 
  Zap, 
  TrendingUp, 
  Clock,
  FileText,
  Tag,
  Activity,
  AlertCircle
} from 'lucide-react'
import { useWebSocket } from '../contexts/WebSocketContext'
import RecentScreenshots from './RecentScreenshots'
import ActivityFeed from './ActivityFeed'
import QuickStats from './QuickStats'

const Dashboard = () => {
  const { stats, recentActivity, isConnected } = useWebSocket()
  const [watcherStatus, setWatcherStatus] = useState('inactive')

  useEffect(() => {
    // Simulate watcher status based on connection
    setWatcherStatus(isConnected ? 'active' : 'inactive')
  }, [isConnected])

  const statusCards = [
    {
      title: 'Watcher Status',
      value: watcherStatus === 'active' ? 'Active' : 'Inactive',
      icon: Activity,
      color: watcherStatus === 'active' ? 'green' : 'red',
      description: watcherStatus === 'active' ? 'Monitoring screenshots' : 'Not monitoring'
    },
    {
      title: 'Total Screenshots',
      value: stats?.totalScreenshots || 0,
      icon: Camera,
      color: 'blue',
      description: 'Screenshots in database'
    },
    {
      title: 'OCR Processed',
      value: stats?.ocrProcessed || 0,
      icon: FileText,
      color: 'purple',
      description: 'Text extracted from images'
    },
    {
      title: 'Categories',
      value: stats?.categories || 0,
      icon: Tag,
      color: 'orange',
      description: 'Auto-categorized screenshots'
    }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to SmartShot</h1>
            <p className="text-primary-100">
              Intelligent screenshot management with OCR and auto-categorization
            </p>
          </div>
          <div className="hidden md:block">
            <Camera className="w-16 h-16 text-primary-200" />
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusCards.map((card, index) => {
          const Icon = card.icon
          const colorClasses = {
            green: 'bg-green-50 text-green-700 border-green-200',
            red: 'bg-red-50 text-red-700 border-red-200',
            blue: 'bg-blue-50 text-blue-700 border-blue-200',
            purple: 'bg-purple-50 text-purple-700 border-purple-200',
            orange: 'bg-orange-50 text-orange-700 border-orange-200'
          }
          
          return (
            <div key={index} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className={`p-3 rounded-lg border ${colorClasses[card.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Screenshots */}
        <div className="lg:col-span-2">
          <RecentScreenshots />
        </div>

        {/* Activity Feed */}
        <div>
          <ActivityFeed />
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Connection Warning */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Connection Lost
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Unable to connect to SmartShot backend. Make sure the Python service is running.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard