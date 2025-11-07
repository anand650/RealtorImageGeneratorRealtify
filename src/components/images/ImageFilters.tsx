'use client'

import { useState } from 'react'
import { Search, Filter, Calendar } from 'lucide-react'

export function ImageFilters() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [dateRange, setDateRange] = useState('')

  const roomTypes = [
    'Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 
    'Dining Room', 'Office', 'Outdoor Space'
  ]

  const styles = [
    'Modern', 'Traditional', 'Minimalist', 'Luxury', 
    'Rustic', 'Industrial', 'Scandinavian'
  ]

  const statuses = [
    'All', 'Completed', 'Processing', 'Failed'
  ]

  const dateRanges = [
    'All Time', 'Last 7 days', 'Last 30 days', 'Last 3 months'
  ]

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedRoomType('')
    setSelectedStyle('')
    setSelectedStatus('')
    setDateRange('')
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type
            </label>
            <select
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Room Types</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Styles</option>
              {styles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dateRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedRoomType || selectedStyle || selectedStatus || dateRange) && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h4>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Search: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedRoomType && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Room: {selectedRoomType}
                    <button
                      onClick={() => setSelectedRoomType('')}
                      className="ml-1 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedStyle && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Style: {selectedStyle}
                    <button
                      onClick={() => setSelectedStyle('')}
                      className="ml-1 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedStatus && selectedStatus !== 'All' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Status: {selectedStatus}
                    <button
                      onClick={() => setSelectedStatus('')}
                      className="ml-1 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {dateRange && dateRange !== 'All Time' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Date: {dateRange}
                    <button
                      onClick={() => setDateRange('')}
                      className="ml-1 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



