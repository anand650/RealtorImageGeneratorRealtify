'use client'

import { useState, useEffect } from 'react'
import { FolderManager } from '@/components/images/FolderManager'
import { EnhancedImageGallery } from '@/components/images/EnhancedImageGallery'
import { SimpleImageModal } from '@/components/images/SimpleImageModal'

interface ImageFolder {
  id: string
  name: string
  description?: string
  parentFolderId?: string
  subFolders?: ImageFolder[]
  imageCount?: number
}

export default function ImagesPage() {
  const [folders, setFolders] = useState<ImageFolder[]>([])
  const [foldersLoading, setFoldersLoading] = useState(true)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined)
  const [unassignedCount, setUnassignedCount] = useState<number | undefined>(undefined)

  // Load folders from API
  useEffect(() => {
    const loadFolders = async () => {
      try {
        setFoldersLoading(true)
        const response = await fetch('/api/folders')
        if (response.ok) {
          const data = await response.json()
          setFolders(data.folders || [])
        } else {
          console.error('Failed to load folders:', response.status)
        }
      } catch (error) {
        console.error('Error loading folders:', error)
      } finally {
        setFoldersLoading(false)
      }
    }

    loadFolders()
  }, [])

  // Load counts for All Images and Uploaded (unassigned) folders
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [allRes, unassignedRes] = await Promise.all([
          fetch('/api/images?limit=1'),
          fetch('/api/images?limit=1&folderId=null')
        ])

        if (allRes.ok) {
          const allData = await allRes.json()
          setTotalCount(allData?.pagination?.total ?? 0)
        }

        if (unassignedRes.ok) {
          const unassignedData = await unassignedRes.json()
          setUnassignedCount(unassignedData?.pagination?.total ?? 0)
        }
      } catch (e) {
        // ignore count errors
      }
    }
    loadCounts()
  }, [])

  const handleFolderCreate = async (name: string, description?: string, parentId?: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          parentFolderId: parentId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newFolder = data.folder

        if (parentId) {
          // Add to parent folder's subFolders
          setFolders(prev => prev.map(folder => {
            if (folder.id === parentId) {
              return {
                ...folder,
                subFolders: [...(folder.subFolders || []), newFolder]
              }
            }
            return folder
          }))
        } else {
          setFolders(prev => [...prev, newFolder])
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to create folder:', errorData.error)
        alert(`Failed to create folder: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('Failed to create folder. Please try again.')
    }
  }

  const handleFolderUpdate = async (id: string, name: string, description?: string) => {
    try {
      const response = await fetch(`/api/folders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const updatedFolder = data.folder

        const updateFolderInTree = (folders: ImageFolder[]): ImageFolder[] => {
          return folders.map(folder => {
            if (folder.id === id) {
              return { ...folder, name: updatedFolder.name, description: updatedFolder.description }
            }
            if (folder.subFolders) {
              return { ...folder, subFolders: updateFolderInTree(folder.subFolders) }
            }
            return folder
          })
        }
        setFolders(prev => updateFolderInTree(prev))
      } else {
        const errorData = await response.json()
        console.error('Failed to update folder:', errorData.error)
        alert(`Failed to update folder: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating folder:', error)
      alert('Failed to update folder. Please try again.')
    }
  }

  const handleFolderDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/folders/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const removeFolderFromTree = (folders: ImageFolder[]): ImageFolder[] => {
          return folders
            .filter(folder => folder.id !== id)
            .map(folder => ({
              ...folder,
              subFolders: folder.subFolders ? removeFolderFromTree(folder.subFolders) : undefined
            }))
        }
        
        setFolders(prev => removeFolderFromTree(prev))
        
        // If we're currently viewing the deleted folder, go back to all images
        if (currentFolderId === id) {
          setCurrentFolderId(null)
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to delete folder:', errorData.error)
        alert(`Failed to delete folder: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      alert('Failed to delete folder. Please try again.')
    }
  }

  const handleImageSelect = (image: any) => {
    setSelectedImage(image)
  }

  const handleImageDelete = (imageId: string) => {
    // In a real app, this would call an API
    console.log('Delete image:', imageId)
  }

  const handleImageFavorite = (imageId: string, isFavorite: boolean) => {
    // In a real app, this would call an API
    console.log('Toggle favorite:', imageId, isFavorite)
  }

  const handleImageMove = (imageId: string, folderId: string | null) => {
    // In a real app, this would call an API
    console.log('Move image:', imageId, 'to folder:', folderId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Images</h1>
        <p className="mt-1 text-sm text-gray-500">
          Organize and manage all your AI-enhanced images.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <FolderManager
            folders={folders}
            currentFolderId={currentFolderId || undefined}
            onFolderSelect={setCurrentFolderId}
            onFolderCreate={handleFolderCreate}
            onFolderUpdate={handleFolderUpdate}
            onFolderDelete={handleFolderDelete}
            unassignedCount={unassignedCount}
            totalCount={totalCount}
          />
        </div>
        
        <div className="lg:col-span-3">
          <EnhancedImageGallery
            currentFolderId={currentFolderId}
            searchQuery={searchQuery}
            onImageSelect={handleImageSelect}
            onImageDelete={handleImageDelete}
            onImageFavorite={handleImageFavorite}
            onImageMove={handleImageMove}
            folders={folders}
          />
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <SimpleImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.processedUrl || selectedImage.originalUrl}
          imageTitle={`${selectedImage.roomType} - ${selectedImage.style}`}
        />
      )}
    </div>
  )
}



