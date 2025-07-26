import React, { useState, useEffect } from 'react'
import { Search, Filter, Calendar, Tag, Monitor, Download, Eye } from 'lucide-react'

const SearchInterface = () => {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    app: '',
    dateRange: '',
    hasOcr: false
  })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [apps, setApps] = useState([])

  useEffect(() => {
    fetchFilters()
    if (query || Object.values(filters).some(v => v)) {
      performSearch()
    }
  }, [query, filters])

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/filters')
      const data = await response.json()
      setCategories(data.categories || [])
      setApps(data.apps || [])
    } catch (error) {
      console.error('Failed to fetch filters:', error)
      // Mock data
      setCategories(['Code', 'Errors', 'Tutorials', 'Chats', 'Documents', 'Media'])
      setApps(['Chrome', 'VSCode', 'Terminal', 'Figma', 'Slack'])
    }
  }

  const performSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.append('query', query)
      if (filters.category) params.append('category', filters.category)
      if (filters.app) params.append('app', filters.app)
      if (filters.dateRange) params.append('days', filters.dateRange)
      
      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Search failed:', error)
      // Mock results
      setResults([
        {
          id: 1,
          file_name: 'Chrome_GitHub_Pull_Request_2025-01-27_14-30-15.png',
          file_path: '/screenshots/Chrome_GitHub_Pull_Request_2025-01-27_14-30-15.png',
          category: 'Code',
          app_name: 'Chrome',
          created_at: new Date().toISOString(),
          ocr_text: 'GitHub repository page showing pull request #123 with code changes in React components',
          file_size: 245760
        },
        {
          id: 2,
          file_name: 'VSCode_TypeError_2025-01-27_14-25-10.png',
          file_path: '/screenshots/VSCode_TypeError_2025-01-27_14-25-10.png',
          category: 'Errors',
          app_name: 'VSCode',
          created_at: new Date(Date.now() - 300000).toISOString(),
          ocr_text: 'TypeError: Cannot read property "map" of undefined at line 42 in components/Dashboard.jsx',
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <Search className="w-6 h-6 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900">Search Screenshots</h1>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by text content, filename, or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Monitor className="w-4 h-4 inline mr-1" />
              Application
            </label>
            <select
              value={filters.app}
              onChange={(e) => setFilters({...filters, app: e.target.value})}
              className="input-field"
            >
              <option value="">All Applications</option>
              {apps.map(app => (
                <option key={app} value={app}>{app}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="input-field"
            >
              <option value="">All Time</option>
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasOcr}
                onChange={(e) => setFilters({...filters, hasOcr: e.target.checked})}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Has OCR text</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Search Results {results.length > 0 && `(${results.length})`}
          </h2>
          {results.length > 0 && (
            <div className="flex items-center space-x-2">
              <button className="btn-secondary text-sm">
                Export Results
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {result.file_name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(result.category)}`}>
                      {result.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                    <span>{result.app_name}</span>
                    <span>{formatTimeAgo(result.created_at)}</span>
                    <span>{formatFileSize(result.file_size)}</span>
                  </div>

                  {result.ocr_text && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {result.ocr_text}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchInterface