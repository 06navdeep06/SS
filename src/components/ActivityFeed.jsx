import React, { useState, useEffect } from 'react'
import { Activity, Camera, FileText, Tag, AlertCircle, CheckCircle } from 'lucide-react'
import { useWebSocket } from '../contexts/WebSocketContext'

const ActivityFeed = () => {
  const { recentActivity } = useWebSocket()
  const [activities, setActivities] = useState([])

  useEffect(() => {
    if (recentActivity && recentActivity.length > 0) {
      setActivities(recentActivity)
    } else {
      // Mock data for demo
      setActivities([
        {
          id: 1,
          type: 'screenshot_processed',
          message: 'New screenshot processed',
          details: 'Chrome_GitHub_2025-01-27_14-30-15.png',
          timestamp: new Date().toISOString(),
          status: 'success'
        },
        {
          id: 2,
          type: 'ocr_completed',
          message: 'OCR text extraction completed',
          details: 'Extracted 45 words from VSCode_Error.png',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          status: 'success'
        },
        {
          id: 3,
          type: 'categorized',
          message: 'Screenshot auto-categorized',
          details: 'Moved to "Errors" category',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          status: 'success'
        },
        {
          id: 4,
          type: 'watcher_started',
          message: 'Screenshot watcher started',
          details: 'Monitoring ~/Pictures/Screenshots',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          status: 'info'
        }
      ])
    }
  }, [recentActivity])

  const getActivityIcon = (type, status) => {
    const iconProps = { className: "w-4 h-4" }
    
    switch (type) {
      case 'screenshot_processed':
        return <Camera {...iconProps} />
      case 'ocr_completed':
        return <FileText {...iconProps} />
      case 'categorized':
        return <Tag {...iconProps} />
      case 'error':
        return <AlertCircle {...iconProps} />
      default:
        return <Activity {...iconProps} />
    }
  }

  const getActivityColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">
              Activity will appear here as screenshots are processed
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                {getActivityIcon(activity.type, activity.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.message}
                </p>
                {activity.details && (
                  <p className="text-xs text-gray-600 mt-1">
                    {activity.details}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All Activity
          </button>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed