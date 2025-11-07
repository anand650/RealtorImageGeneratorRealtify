'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Download, 
  Heart, 
  MoreHorizontal, 
  Trash2, 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  Tag,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Folder,
  FolderPlus,
  Move,
  Share2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageData {
  id: string
  originalUrl: string
  processedUrl?: string
  thumbnailUrl?: string
  roomType: string
  style: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  isFavorite: boolean
  processingTime?: number
  tags: string[]
  clientNotes?: string
  folderId?: string
  userId?: string
  user?: {
    id: string
    firstName?: string
    lastName?: string
    email: string
    profileImageUrl?: string
  }
}

interface TeamMember {
  id: string
  firstName?: string
  lastName?: string
  email: string
  profileImageUrl?: string
}

interface ImageFolder {
  id: string
  name: string
  description?: string
  parentFolderId?: string
  subFolders?: ImageFolder[]
  imageCount?: number
}

interface EnhancedImageGalleryProps {
  currentFolderId?: string | null
  searchQuery?: string
  onImageSelect?: (image: ImageData) => void
  onImageDelete?: (imageId: string) => void
  onImageFavorite?: (imageId: string, isFavorite: boolean) => void
  onImageMove?: (imageId: string, folderId: string | null) => void
  folders?: ImageFolder[]
}

export function EnhancedImageGallery({
  currentFolderId,
  searchQuery: externalSearchQuery,
  onImageSelect,
  onImageDelete,
  onImageFavorite,
  onImageMove,
  folders = []
}: EnhancedImageGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(externalSearchQuery || '')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRoomType, setFilterRoomType] = useState<string>('all')
  const [filterOwner, setFilterOwner] = useState<string>('all') // 'all', 'me', or userId
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [moveTargetFolder, setMoveTargetFolder] = useState<string | null>(null)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 })
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const actionsMenuRef = useRef<HTMLDivElement>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const mapApiImageToState = (img: any): ImageData => ({
    id: img.id,
    originalUrl: img.originalUrl,
    processedUrl: img.processedUrl || undefined,
    thumbnailUrl: img.thumbnailUrl || img.processedUrl || img.originalUrl,
    roomType: img.roomType || '',
    style: img.style || '',
    status: img.status,
    createdAt: img.createdAt,
    isFavorite: Boolean(img.isFavorite),
    processingTime: typeof img.processingTime === 'number' ? img.processingTime : undefined,
    tags: Array.isArray(img.tags) ? img.tags : [],
    folderId: img.folderId || undefined,
    clientNotes: img.clientNotes || '',
    userId: img.userId,
    user: img.user
  })

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false)
      }
    }

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActionsMenu])

  // Reset quick filters when switching folders to avoid accidental hiding
  useEffect(() => {
    setFilterStatus('all')
    setFilterRoomType('all')
    setFilterOwner('all')
    setSearchQuery('')
  }, [currentFolderId])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Show toast message
  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Load images from API with optimized fetching
  useEffect(() => {
    let isCancelled = false
    const loadImages = async () => {
      try {
        setLoading(true)
        const buildParams = (page: number) => {
          const params = new URLSearchParams()
          params.set('limit', '50')
          params.set('page', page.toString())
          if (currentFolderId && currentFolderId !== '__UPLOADED__') {
            params.set('folderId', currentFolderId)
          } else if (currentFolderId === '__UPLOADED__') {
            params.set('folderId', 'null')
          }
          if (filterRoomType !== 'all') params.set('roomType', filterRoomType)
          if (filterStatus !== 'all') params.set('status', filterStatus)
          if (filterOwner !== 'all') params.set('owner', filterOwner)
          if (debouncedSearchQuery) params.set('search', debouncedSearchQuery)
          return params
        }

        const firstRes = await fetch(`/api/images?${buildParams(1).toString()}`)
        if (!firstRes.ok) {
          throw new Error('Failed to load images')
        }
        const firstData = await firstRes.json()

        let allImages: any[] = firstData.images || []
        const totalPages = firstData.pagination?.pages || 1

        if (totalPages > 1) {
          const additionalPages = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) => index + 2)
              .map(async (pageNumber) => {
                const res = await fetch(`/api/images?${buildParams(pageNumber).toString()}`)
                if (!res.ok) {
                  return null
                }
                return res.json()
              })
          )

          additionalPages.forEach((data) => {
            if (data?.images) {
              allImages = allImages.concat(data.images)
            }
          })
        }

        if (!isCancelled) {
          setImages(allImages.map(mapApiImageToState))
          setTeamMembers(firstData.teamMembers || [])
          setCurrentUserId(firstData.currentUserId || '')
          setPagination({
            page: 1,
            limit: 50,
            total: firstData.pagination?.total ?? allImages.length,
            pages: totalPages
          })
        }
      } catch (e) {
        if (!isCancelled) {
          setImages([])
        }
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }
    loadImages()

    return () => {
      isCancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId, filterRoomType, filterStatus, filterOwner, debouncedSearchQuery, reloadKey])

  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery)
    }
  }, [externalSearchQuery])

  // Move images to folder
  const handleMoveImages = async () => {
    if (selectedImages.length === 0) return

    try {
      const response = await fetch('/api/images/bulk-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageIds: selectedImages,
          folderId: moveTargetFolder,
        }),
      })

      if (response.ok) {
        // Refresh images to show updated folder assignments
        setReloadKey((key) => key + 1)

        setSelectedImages([])
        setShowMoveDialog(false)
        setMoveTargetFolder(null)
      } else {
        const errorData = await response.json()
        console.error('Failed to move images:', errorData.error)
        alert(`Failed to move images: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error moving images:', error)
      alert('Failed to move images. Please try again.')
    }
  }

  // Move single image to folder
  const handleMoveSingleImage = async (imageId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/images/${imageId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderId: folderId,
        }),
      })

      if (response.ok) {
        // Update the image in the local state
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, folderId: folderId ?? undefined }
            : img
        ))
      } else {
        const errorData = await response.json()
        console.error('Failed to move image:', errorData.error)
        alert(`Failed to move image: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error moving image:', error)
      alert('Failed to move image. Please try again.')
    }
  }

  // Bulk download images
  const handleBulkDownload = async () => {
    if (selectedImages.length === 0) return

    try {
      // Get download URLs for selected images
      const downloadPromises = selectedImages.map(async (imageId) => {
        const image = images.find(img => img.id === imageId)
        if (!image) return null

        // Get fresh download URL from API
        const response = await fetch(`/api/images/${imageId}`)
        if (response.ok) {
          const data = await response.json()
          return {
            url: data.image.processedUrl || data.image.originalUrl,
            name: `${image.roomType}_${image.style}_${image.id}.jpg`
          }
        }
        return null
      })

      const downloadData = await Promise.all(downloadPromises)
      const validDownloads = downloadData.filter(data => data !== null)
      
      if (validDownloads.length === 0) {
        alert('No valid images to download.')
        return
      }

      // Download each image with a small delay
      validDownloads.forEach((data, index) => {
        setTimeout(() => {
          const link = document.createElement('a')
          link.href = data.url
          link.download = data.name
          link.target = '_blank'
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }, index * 200) // Stagger downloads by 200ms
      })

      showToast(`Starting download of ${validDownloads.length} image${validDownloads.length !== 1 ? 's' : ''}...`)
      setSelectedImages([])
    } catch (error) {
      console.error('Error downloading images:', error)
      showToast('Failed to download images. Please try again.')
    }
  }

  // Bulk share images
  const handleBulkShare = async () => {
    if (selectedImages.length === 0) return

    try {
      // Get share URLs for selected images
      const sharePromises = selectedImages.map(async (imageId) => {
        const image = images.find(img => img.id === imageId)
        if (!image) return null

        const response = await fetch(`/api/images/${imageId}`)
        if (response.ok) {
          const data = await response.json()
          return {
            url: data.image.processedUrl || data.image.originalUrl,
            name: `${image.roomType}_${image.style}_${image.id}.jpg`
          }
        }
        return null
      })

      const shareData = await Promise.all(sharePromises)
      const validShares = shareData.filter(data => data !== null)

      if (validShares.length === 0) {
        alert('No valid images to share.')
        return
      }

      // Create a formatted text with image names and URLs
      const shareText = validShares.map(data => 
        `${data.name}\n${data.url}`
      ).join('\n\n')

      // Copy to clipboard
      await navigator.clipboard.writeText(shareText)
      
      showToast(`Copied ${validShares.length} image URL${validShares.length !== 1 ? 's' : ''} with names to clipboard!`)
      setSelectedImages([])
    } catch (error) {
      console.error('Error sharing images:', error)
      showToast('Failed to share images. Please try again.')
    }
  }

  // Bulk delete images
  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return

    const confirmed = confirm(`Are you sure you want to delete ${selectedImages.length} image${selectedImages.length !== 1 ? 's' : ''}? This action cannot be undone.`)
    if (!confirmed) return

    try {
      const deletePromises = selectedImages.map(imageId => 
        onImageDelete?.(imageId)
      )

      await Promise.all(deletePromises)
      
      // Remove deleted images from local state
      setImages(prev => prev.filter(img => !selectedImages.includes(img.id)))
      setSelectedImages([])
    } catch (error) {
      console.error('Error deleting images:', error)
      alert('Failed to delete some images. Please try again.')
    }
  }

  const filteredImages = images.filter(image => {
    // Folder filter (client-side safeguard even if API filtered)
    if (currentFolderId && currentFolderId !== '__UPLOADED__') {
      const matchesFolder = (image.folderId || null) === currentFolderId
      if (!matchesFolder) return false
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        image.roomType.toLowerCase().includes(query) ||
        image.style.toLowerCase().includes(query) ||
        image.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (image.clientNotes && image.clientNotes.toLowerCase().includes(query))
      
      if (!matchesSearch) return false
    }

    // Status filter
    if (filterStatus !== 'all' && image.status !== filterStatus) {
      return false
    }

    // Room type filter
    if (filterRoomType !== 'all' && image.roomType !== filterRoomType) {
      return false
    }

    return true
  })
  
  // Debug logging removed for performance

  const sortedImages = [...filteredImages].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'name':
        return a.roomType.localeCompare(b.roomType)
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getRoomTypeDisplayName = (roomType: string) => {
    const names: Record<string, string> = {
      living_room: 'Living Room',
      bedroom: 'Bedroom',
      kitchen: 'Kitchen',
      bathroom: 'Bathroom',
      dining_room: 'Dining Room',
      office: 'Office'
    }
    return names[roomType] || roomType
  }

  const getStyleDisplayName = (style: string) => {
    const names: Record<string, string> = {
      modern: 'Modern',
      traditional: 'Traditional',
      luxury: 'Luxury',
      cozy: 'Cozy',
      minimalist: 'Minimalist',
      scandinavian: 'Scandinavian'
    }
    return names[style] || style
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-10 bg-gray-200 rounded-md w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-md w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-md w-20 animate-pulse"></div>
          </div>
        </div>
        
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 w-full mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search images, tags, room types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-wrap">
          {/* Owner Filter - only show if there are team members */}
          {teamMembers.length > 1 && (
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Team Images</option>
              <option value="me">My Images Only</option>
              {teamMembers.filter(m => m.id !== currentUserId).map(member => (
                <option key={member.id} value={member.id}>
                  {member.firstName || member.lastName 
                    ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                    : member.email}
                </option>
              ))}
            </select>
          )}
          
          {/* Filters */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={filterRoomType}
            onChange={(e) => setFilterRoomType(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Rooms</option>
            <option value="living_room">Living Room</option>
            <option value="bedroom">Bedroom</option>
            <option value="kitchen">Kitchen</option>
            <option value="bathroom">Bathroom</option>
          </select>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'status')}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Room</option>
            <option value="status">Sort by Status</option>
          </select>
          
          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results count and bulk actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="text-sm text-gray-600">
          {sortedImages.length} image{sortedImages.length !== 1 ? 's' : ''} found
          {selectedImages.length > 0 && (
            <span className="ml-2">
              ({selectedImages.length} selected)
            </span>
          )}
        </div>
        
        {/* Bulk Actions */}
        {selectedImages.length > 0 && (
          <div className="relative" ref={actionsMenuRef}>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="flex items-center gap-2"
            >
              <MoreHorizontal className="h-4 w-4" />
              Actions ({selectedImages.length})
            </Button>

            {/* Actions Dropdown Menu */}
            {showActionsMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowMoveDialog(true)
                      setShowActionsMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Folder className="h-4 w-4 text-blue-600" />
                    Move to Folder
                  </button>
                  
                  <button
                    onClick={() => {
                      handleBulkDownload()
                      setShowActionsMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4 text-green-600" />
                    Download
                  </button>
                  
                  <button
                    onClick={() => {
                      handleBulkShare()
                      setShowActionsMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4 text-purple-600" />
                    Share URLs
                  </button>
                  
                  <div className="border-t border-gray-200 my-1" />
                  
                  <button
                    onClick={() => {
                      handleBulkDelete()
                      setShowActionsMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                  
                  <div className="border-t border-gray-200 my-1" />
                  
                  <button
                    onClick={() => {
                      setSelectedImages([])
                      setShowActionsMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Grid/List */}
      {sortedImages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto mb-2" />
            <p>No images found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'
        )}>
          {sortedImages.map((image) => (
            <Card 
              key={image.id} 
              className={cn(
                'group cursor-pointer transition-all hover:shadow-md',
                selectedImages.includes(image.id) && 'ring-2 ring-blue-500',
                viewMode === 'list' && 'flex flex-row'
              )}
              onClick={() => onImageSelect?.(image)}
            >
              <div className={cn(
                'relative',
                viewMode === 'list' ? 'w-32 h-24 flex-shrink-0' : 'aspect-[4/3]'
              )}>
                <img
                  src={image.thumbnailUrl || image.processedUrl || image.originalUrl}
                  alt={`${getRoomTypeDisplayName(image.roomType)} - ${getStyleDisplayName(image.style)}`}
                  className="w-full h-full object-cover rounded-t-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.svg'
                  }}
                />
                
                {/* Status overlay */}
                <div className="absolute top-2 left-2">
                  {getStatusIcon(image.status)}
                </div>
                
                {/* Favorite */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity',
                    image.isFavorite && 'opacity-100'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onImageFavorite?.(image.id, !image.isFavorite)
                  }}
                >
                  <Heart className={cn(
                    'h-4 w-4',
                    image.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                  )} />
                </Button>

                {/* Individual Image Actions */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg p-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-md"
                      onClick={async (e) => {
                        e.stopPropagation()
                        try {
                          const response = await fetch(`/api/images/${image.id}`)
                          if (response.ok) {
                            const data = await response.json()
                            const url = data.image.processedUrl || data.image.originalUrl
                            
                            // Create a temporary link to download
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `${image.roomType}_${image.style}_${image.id}.jpg`
                            link.target = '_blank'
                            link.style.display = 'none'
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            
                            // Show success message
                            showToast('Download started!')
                          } else {
                            throw new Error('Failed to get image URL')
                          }
                        } catch (error) {
                          console.error('Error downloading image:', error)
                          showToast('Failed to download image. Please try again.')
                        }
                      }}
                      title="Download image"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-md"
                      onClick={async (e) => {
                        e.stopPropagation()
                        try {
                          const response = await fetch(`/api/images/${image.id}`)
                          if (response.ok) {
                            const data = await response.json()
                            const url = data.image.processedUrl || data.image.originalUrl
                            
                            // Copy to clipboard
                            await navigator.clipboard.writeText(url)
                            showToast('Image URL copied to clipboard!')
                          } else {
                            throw new Error('Failed to get image URL')
                          }
                        } catch (error) {
                          console.error('Error sharing image:', error)
                          showToast('Failed to copy URL. Please try again.')
                        }
                      }}
                      title="Copy image URL"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Set this image as selected and open move dialog
                        setSelectedImages([image.id])
                        setShowMoveDialog(true)
                      }}
                      title="Move to folder"
                    >
                      <Folder className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-300 hover:bg-red-500/20 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Are you sure you want to delete this ${getRoomTypeDisplayName(image.roomType)} image? This action cannot be undone.`)) {
                          onImageDelete?.(image.id)
                        }
                      }}
                      title="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Selection checkbox */}
                <div className="absolute bottom-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(image.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleImageSelection(image.id)
                    }}
                    className="rounded"
                  />
                </div>
              </div>
              
              <CardContent className={cn(
                'p-4',
                viewMode === 'list' && 'flex-1'
              )}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">
                      {getRoomTypeDisplayName(image.roomType)}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {getStyleDisplayName(image.style)}
                    </Badge>
                  </div>
                  
                  {image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {image.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {image.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{image.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Folder assignment */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Folder className="h-3 w-3" />
                      <span>
                        {image.folderId 
                          ? folders.find(f => f.id === image.folderId)?.name || 'Unknown Folder'
                          : 'No folder'
                        }
                      </span>
                    </div>
                    
                    {/* Quick move dropdown */}
                    <select
                      value={image.folderId || ''}
                      onChange={(e) => handleMoveSingleImage(image.id, e.target.value || null)}
                      className="text-xs border rounded px-1 py-0.5 bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">No folder</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                    {image.processingTime && (
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {image.processingTime}s
                      </span>
                    )}
                  </div>
                  
                  {/* Creator info - only show if in team and not current user */}
                  {image.user && teamMembers.length > 1 && (
                    <div className="flex items-center text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {image.user.profileImageUrl ? (
                          <img 
                            src={image.user.profileImageUrl} 
                            alt={image.user.firstName || image.user.email}
                            className="h-5 w-5 rounded-full"
                          />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-semibold">
                            {(image.user.firstName?.[0] || image.user.email[0]).toUpperCase()}
                          </div>
                        )}
                        <span className={cn(
                          "text-xs",
                          image.userId === currentUserId ? "text-blue-600 font-medium" : "text-gray-600"
                        )}>
                          {image.userId === currentUserId 
                            ? "You" 
                            : (image.user.firstName || image.user.lastName 
                                ? `${image.user.firstName || ''} ${image.user.lastName || ''}`.trim()
                                : image.user.email.split('@')[0]
                              )
                          }
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {viewMode === 'list' && image.clientNotes && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {image.clientNotes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2 duration-300">
          {toastMessage}
        </div>
      )}

      {/* Move Dialog */}
      {showMoveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Move Images to Folder</h3>
            <p className="text-sm text-gray-600 mb-4">
              Move {selectedImages.length} selected image{selectedImages.length !== 1 ? 's' : ''} to:
            </p>
            
            <div className="space-y-2 mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="folder"
                  value=""
                  checked={moveTargetFolder === null}
                  onChange={() => setMoveTargetFolder(null)}
                  className="rounded"
                />
                <span className="text-sm">No folder (All Images)</span>
              </label>
              
              {folders.map((folder) => (
                <label key={folder.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="folder"
                    value={folder.id}
                    checked={moveTargetFolder === folder.id}
                    onChange={() => setMoveTargetFolder(folder.id)}
                    className="rounded"
                  />
                  <Folder className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{folder.name}</span>
                  {folder.imageCount !== undefined && (
                    <span className="text-xs text-gray-500">({folder.imageCount})</span>
                  )}
                </label>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMoveDialog(false)
                  setMoveTargetFolder(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleMoveImages}>
                Move Images
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
