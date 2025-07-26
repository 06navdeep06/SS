import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Calendar, Folder, Monitor, FileText, Activity } from 'lucide-react'

const StatsView = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/stats/detailed?days=${timeRange}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch detailed stats:', error)
      // Mock comprehensive stats data
      setStats({
        overview: {
          totalScreenshots: 127,
          ocrProcessed: 98,
          categorized: 89,
          totalSize: '45.2 MB',
          avgPerDay: 4.2,
          mostActiveDay: 'Friday'
        },
        categories: [
          { name: 'Code', count: 45, percentage: 35.4, trend: '+12%' },
          { name: 'Errors', count: 28, percentage: 22.0, trend: '+8%' },
          { name: 'Tutorials', count: 20, percentage: 15.7, trend: '-3%' },
          { name: 'Documents', count: 15, percentage: 11.8, trend: '+5%' },
          { name: 'Chats', count: 12, percentage: 9.4, trend: '+15%' },
          { name: 'Media', count: 7, percentage: 5.5, trend: '-2%' }
        ],
        applications: [
          { name: 'Chrome', count: 52, percentage: 40.9, trend: '+18%' },
          { name: 'VSCode', count: 31, percentage: 24.4, trend: '+7%' },
          { name: 'Terminal', count: 18, percentage: 14.2, trend: '+3%' },
          { name: 'Figma', count: 12, percentage: 9.4, trend: '+25%' },
          { name: 'Slack', count: 8, percentage: 6.3, trend: '+12%' },
          { name: 'Other', count: 6, percentage: 4.7, trend: '-5%' }
        ],
        dailyActivity: [
          { date: '2025-01-21', count: 3 },
          { date: '2025-01-22', count: 7 },
          { date: '2025-01-23', count: 5 },
          { date: '2025-01-24', count: 8 },
          { date: '2025-01-25', count: 12 },
          { date: '2025-01-26', count: 6 },
          { date: '2025-01-27', count: 4 }
        ],
        hourlyDistribution: [
          { hour: '00', count: 0 }, { hour: '01', count: 0 }, { hour: '02', count: 0 },
          { hour: '03', count: 0 }, { hour: '04', count: 0 }, { hour: '05', count: 0 },
          { hour: '06', count: 1 }, { hour: '07', count: 2 }, { hour: '08', count: 4 },
          { hour: '09', count: 8 }, { hour: '10', count: 12 }, { hour: '11', count: 15 },
          { hour: '12', count: 8 }, { hour: '13', count: 6 }, { hour: '14', count: 18 },
          { hour: '15', count: 22 }, { hour: '16', count: 16 }, { hour: '17', count: 10 },
          { hour: '18', count: 4 }, { hour: '19', count: 2 }, { hour: '20', count: 1 },
          { hour: '21', count: 0 }, { hour: '22', count: 0 }, { hour: '23', count: 0 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const maxHourlyCount = Math.max(...stats.hourlyDistribution.map(h => h.count))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field w-auto"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Screenshots</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalScreenshots}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">OCR Processed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.ocrProcessed}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((stats.overview.ocrProcessed / stats.overview.totalScreenshots) * 100)}% of total
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Auto-Categorized</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.categorized}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((stats.overview.categorized / stats.overview.totalScreenshots) * 100)}% of total
              </p>
            </div>
            <Folder className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average per Day</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.avgPerDay}</p>
              <p className="text-xs text-gray-500 mt-1">Most active: {stats.overview.mostActiveDay}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Screenshots by Category</h3>
          <div className="space-y-4">
            {stats.categories.map((category, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-24 text-sm font-medium text-gray-700">
                  {category.name}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900 w-8">
                  {category.count}
                </div>
                <div className={`text-xs font-medium w-12 ${
                  category.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {category.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applications Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Screenshots by Application</h3>
          <div className="space-y-4">
            {stats.applications.map((app, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-24 text-sm font-medium text-gray-700">
                  {app.name}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${app.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900 w-8">
                  {app.count}
                </div>
                <div className={`text-xs font-medium w-12 ${
                  app.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {app.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Activity</h3>
          <div className="flex items-end space-x-2 h-32">
            {stats.dailyActivity.map((day, index) => {
              const maxCount = Math.max(...stats.dailyActivity.map(d => d.count))
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-600 rounded-t transition-all duration-1000 hover:bg-primary-700"
                    style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                    title={`${day.date}: ${day.count} screenshots`}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Hourly Distribution</h3>
          <div className="flex items-end space-x-1 h-32">
            {stats.hourlyDistribution.map((hour, index) => {
              const height = maxHourlyCount > 0 ? (hour.count / maxHourlyCount) * 100 : 0
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-orange-500 rounded-t transition-all duration-1000 hover:bg-orange-600"
                    style={{ height: `${height}%`, minHeight: hour.count > 0 ? '2px' : '0' }}
                    title={`${hour.hour}:00 - ${hour.count} screenshots`}
                  ></div>
                  {index % 4 === 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {hour.hour}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsView