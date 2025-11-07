'use client'

import Link from 'next/link'
import { Eye, Download, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'

interface RecentImage {
  id: string
  thumbnailUrl?: string | null
  roomType: string | null
  style: string | null
  status: string
  createdAt: string
  isFavorite?: boolean
}

export function RecentImages() {
  const [images, setImages] = useState<RecentImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentImages() {
      try {
        const response = await fetch('/api/images?limit=4&page=1')
        if (response.ok) {
          const data = await response.json()
          setImages(data.images || [])
        }
      } catch (error) {
        console.error('Error fetching recent images:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentImages()
  }, [])

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Images</h3>
            <Link
              href="/images"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 text-center text-gray-500 py-8">
            <p>No images yet. Start by creating your first enhanced image!</p>
            <Link href="/generate" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
              Create Image →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Images</h3>
          <Link
            href="/images"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {images.map((image) => (
              <Link
                key={image.id}
                href={`/images?id=${image.id}`}
                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
              >
                <img
                  src={image.thumbnailUrl || '/placeholder-image.svg'}
                  alt={`${image.roomType || 'Room'} - ${image.style || 'Style'}`}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                />
                
                {/* Status overlay */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      image.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : image.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {image.status}
                  </span>
                </div>

                {/* Favorite button */}
                {image.isFavorite && (
                  <div className="absolute top-2 right-2 p-1 rounded-full bg-white/80">
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                  <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <Eye className="h-4 w-4 text-white" />
                  </button>
                  <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <Download className="h-4 w-4 text-white" />
                  </button>
                </div>

                {/* Image info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {image.roomType || 'Room'}
                  </p>
                  <p className="text-white/80 text-xs truncate">{image.style || 'Style'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}



