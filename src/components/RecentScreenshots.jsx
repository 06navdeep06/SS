import React, { useState, useEffect } from 'react'
import { Eye, Download, Tag, Clock, FileText } from 'lucide-react'

const RecentScreenshots = () => {
  const [screenshots, setScreenshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchRecentScreenshots()
  }, [])

  const fetchRecentScreenshots = async () => {
    try {
      const response = await fetch('/api/screenshots/recent?limit=10')
      const data = await response.json()
      setScreenshots(data.screenshots || [])
    } catch (error) {
      console.error('Failed to fetch recent screenshots:', error)
      // Mock data for demo
      setScreenshots([
        {
          id: 1,
          file_name: 'Chrome_GitHub_2025-01-27_14-30-15.png',
          file_path: '/screenshots/Chrome_GitHub_2025-01-27_14-30-15.png',
          category: 'Code',
          app_name: 'Chrome',
          created_at: new Date().toISOString(),
          ocr_text: 'GitHub repository page with pull request details',
          file_size: 245760
        },
        {
          id: 2,
          file_name: 'VSCode_Error_2025-01-27_14-25-10.png',
          file_path: '/screenshots/VSCode_Error_2025-01-27_14-25-10.png',
          category: 'Errors',
          app_name: 'VSCode',
          created_at: new Date(Date.now() - 300000).toISOString(),
          ocr_text: 'TypeError: Cannot read property of undefined',
          file_size: 189440
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const getCategoryColor = (category) => {
    const colors = {
      'Code': 'bg-blue-100 text-blue-800',
      'Errors': 'bg-red-100 text-red-800',
      'Tutorials': 'bg-green-100 text-green-800',
      'Chats': 'bg-purple-100 text-purple-800',
      'Documents': 'bg-orange-100 text-orange-800',
      'Media': 'bg-pink-100 text-pink-800',
      'Uncategorized': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors['Uncategorized']
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Screenshots</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Screenshots</h2>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {screenshots.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No screenshots found</p>
            <p className="text-sm text-gray-400 mt-1">
              Screenshots will appear here once the watcher is active
            </p>
          </div>
        ) : (
          screenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedImage(screenshot)}
            >
              {/* Thumbnail placeholder */}
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>

              {/* Screenshot info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {screenshot.file_name}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(screenshot.category)}`}>
                    {screenshot.category}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(screenshot.created_at)}</span>
                  </span>
                  <span>{screenshot.app_name}</span>
                  <span>{formatFileSize(screenshot.file_size)}</span>
                </div>

                {screenshot.ocr_text && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {screenshot.ocr_text.substring(0, 100)}...
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedImage.file_name}</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Image preview not available</p>
                </div>
                
                {selectedImage.ocr_text && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Extracted Text:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedImage.ocr_text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecentScreenshots