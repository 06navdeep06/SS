import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Calendar, Folder } from 'lucide-react'

const QuickStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/overview')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Mock data for demo
      setStats({
        topCategories: [
          { name: 'Code', count: 45, percentage: 35 },
          { name: 'Errors', count: 28, percentage: 22 },
          { name: 'Tutorials', count: 20, percentage: 16 },
          { name: 'Documents', count: 15, percentage: 12 },
          { name: 'Other', count: 19, percentage: 15 }
        ],
        topApps: [
          { name: 'Chrome', count: 52, percentage: 40 },
          { name: 'VSCode', count: 31, percentage: 24 },
          { name: 'Terminal', count: 18, percentage: 14 },
          { name: 'Figma', count: 12, percentage: 9 },
          { name: 'Other', count: 17, percentage: 13 }
        ],
        weeklyTrend: [
          { day: 'Mon', count: 12 },
          { day: 'Tue', count: 19 },
          { day: 'Wed', count: 8 },
          { day: 'Thu', count: 24 },
          { day: 'Fri', count: 31 },
          { day: 'Sat', count: 6 },
          { day: 'Sun', count: 4 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="card">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Categories */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Folder className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top Categories</h3>
        </div>
        
        <div className="space-y-4">
          {stats?.topCategories?.map((category, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm font-medium text-gray-700">
                {category.name}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 w-8">
                {category.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Applications */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top Applications</h3>
        </div>
        
        <div className="space-y-4">
          {stats?.topApps?.map((app, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm font-medium text-gray-700">
                {app.name}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${app.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 w-8">
                {app.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuickStats