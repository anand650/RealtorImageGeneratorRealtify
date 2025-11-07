'use client'

import { useState } from 'react'
import { 
  Eye, 
  Download, 
  Heart, 
  MoreHorizontal, 
  Trash2, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Grid3X3,
  List,
  Filter,
  Search,
  Sparkles,
  Camera,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const mockImages = [
  {
    id: '1',
    originalUrl: '/api/placeholder/400/300',
    processedUrl: '/api/placeholder/400/300',
    roomType: 'Living Room',
    style: 'Modern',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    isFavorite: false,
    processingTime: 120,
  },
  {
    id: '2',
    originalUrl: '/api/placeholder/400/300',
    processedUrl: '/api/placeholder/400/300',
    roomType: 'Kitchen',
    style: 'Traditional',
    status: 'completed',
    createdAt: '2024-01-15T09:15:00Z',
    isFavorite: true,
    processingTime: 95,
  },
  {
    id: '3',
    originalUrl: '/api/placeholder/400/300',
    processedUrl: null,
    roomType: 'Bedroom',
    style: 'Minimalist',
    status: 'processing',
    createdAt: '2024-01-15T08:45:00Z',
    isFavorite: false,
    processingTime: null,
  },
  {
    id: '4',
    originalUrl: '/api/placeholder/400/300',
    processedUrl: '/api/placeholder/400/300',
    roomType: 'Bathroom',
    style: 'Luxury',
    status: 'completed',
    createdAt: '2024-01-14T16:20:00Z',
    isFavorite: false,
    processingTime: 150,
  },
  {
    id: '5',
    originalUrl: '/api/placeholder/400/300',
    processedUrl: null,
    roomType: 'Office',
    style: 'Industrial',
    status: 'failed',
    createdAt: '2024-01-14T14:10:00Z',
    isFavorite: false,
    processingTime: null,
  },
]

export function ImageGallery() {
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing' | 'failed'>('all')

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const toggleFavorite = (imageId: string) => {
    // TODO: Implement favorite toggle
    console.log('Toggle favorite:', imageId)
  }

  const downloadImage = (imageId: string, type: 'original' | 'processed') => {
    // TODO: Implement download
    console.log('Download image:', imageId, type)
  }

  const deleteImage = (imageId: string) => {
    // TODO: Implement delete
    console.log('Delete image:', imageId)
  }

  const filteredImages = mockImages.filter(image => {
    const matchesSearch = image.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         image.style.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || image.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <div className="card-luxury-gradient">
        {/* Header */}
        <div className="p-8 border-b border-luxury-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-luxury-900 mb-2">
                Image Gallery
              </h2>
              <p className="text-luxury-600">
                Manage and organize your enhanced real estate images
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-luxury-400" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 w-64 rounded-xl border border-luxury-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 rounded-xl border border-luxury-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-luxury-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-gold-100 text-gold-700 shadow-md' 
                      : 'text-luxury-400 hover:text-luxury-600 hover:bg-luxury-50'
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-gold-100 text-gold-700 shadow-md' 
                      : 'text-luxury-400 hover:text-luxury-600 hover:bg-luxury-50'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
              
              <div className="text-luxury-600">
                <span className="font-semibold">{filteredImages.length}</span> images found
              </div>
            </div>
            
            {selectedImages.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-luxury-600">
                  {selectedImages.length} selected
                </span>
                <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative card-luxury-gradient overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={image.originalUrl}
                      alt={`${image.roomType} - ${image.style}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Selection checkbox */}
                    <div className="absolute top-3 left-3">
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(image.id)}
                        onChange={() => toggleImageSelection(image.id)}
                        className="h-5 w-5 text-gold-600 focus:ring-gold-500 border-luxury-300 rounded"
                      />
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          image.status === 'completed'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : image.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : image.status === 'failed'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-luxury-100 text-luxury-800 border border-luxury-200'
                        }`}
                      >
                        {image.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {image.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                        {image.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {image.status}
                      </span>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                      <button
                        onClick={() => console.log('View image:', image.id)}
                        className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                      >
                        <Eye className="h-5 w-5 text-white" />
                      </button>
                      {image.status === 'completed' && (
                        <button
                          onClick={() => downloadImage(image.id, 'processed')}
                          className="p-3 rounded-full bg-gold-500/80 hover:bg-gold-500 transition-colors backdrop-blur-sm"
                        >
                          <Download className="h-5 w-5 text-white" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Image info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-luxury-900 mb-1">
                          {image.roomType}
                        </h4>
                        <p className="text-luxury-600 font-medium">{image.style}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFavorite(image.id)}
                          className="p-2 rounded-full hover:bg-luxury-100 transition-colors"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              image.isFavorite ? 'text-red-500 fill-current' : 'text-luxury-400'
                            }`}
                          />
                        </button>
                        <button className="p-2 rounded-full hover:bg-luxury-100 transition-colors">
                          <MoreHorizontal className="h-5 w-5 text-luxury-400" />
                        </button>
                      </div>
                    </div>
                    
                    {image.processingTime && (
                      <div className="flex items-center text-sm text-luxury-500">
                        <Clock className="h-4 w-4 mr-2" />
                        Processed in {image.processingTime}s
                      </div>
                    )}
                    
                    {image.status === 'completed' && (
                      <div className="mt-3 flex items-center text-sm text-green-600">
                        <Award className="h-4 w-4 mr-2" />
                        Ready for listing
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="card-luxury-gradient p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center space-x-6">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => toggleImageSelection(image.id)}
                      className="h-5 w-5 text-gold-600 focus:ring-gold-500 border-luxury-300 rounded"
                    />
                    
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                      <img
                        src={image.originalUrl}
                        alt={`${image.roomType} - ${image.style}`}
                        className="w-full h-full object-cover"
                      />
                      {image.status === 'completed' && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-bold text-luxury-900">
                          {image.roomType} - {image.style}
                        </h4>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            image.status === 'completed'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : image.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : image.status === 'failed'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-luxury-100 text-luxury-800 border border-luxury-200'
                          }`}
                        >
                          {image.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {image.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                          {image.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {image.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-luxury-500">
                        <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                        {image.processingTime && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {image.processingTime}s
                          </span>
                        )}
                        {image.status === 'completed' && (
                          <span className="flex items-center text-green-600">
                            <Award className="h-4 w-4 mr-1" />
                            Ready for listing
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleFavorite(image.id)}
                        className="p-2 rounded-full hover:bg-luxury-100 transition-colors"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            image.isFavorite ? 'text-red-500 fill-current' : 'text-luxury-400'
                          }`}
                        />
                      </button>
                      {image.status === 'completed' && (
                        <button
                          onClick={() => downloadImage(image.id, 'processed')}
                          className="p-2 rounded-full hover:bg-luxury-100 transition-colors"
                        >
                          <Download className="h-5 w-5 text-luxury-400" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteImage(image.id)}
                        className="p-2 rounded-full hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



