'use client'

import React from 'react'
import { X, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SimpleImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  imageTitle: string
}

export function SimpleImageModal({ isOpen, onClose, imageUrl, imageTitle }: SimpleImageModalProps) {
  if (!isOpen) return null

  const handleDownload = async () => {
    try {
      // Fetch the image as a blob to ensure proper download
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }
      const blob = await response.blob()
      
      // Create object URL from blob
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Create a temporary link to download the image
      const link = document.createElement('a')
      link.href = blobUrl
      // Use a clean filename without any tech references
      const cleanTitle = imageTitle.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
      link.download = `${cleanTitle || 'enhanced_image'}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback to direct download
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `${imageTitle.replace(/\s+/g, '_')}.jpg`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: imageTitle,
          url: imageUrl,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(imageUrl)
        alert('Image URL copied to clipboard!')
      } catch (error) {
        console.log('Error copying to clipboard:', error)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{imageTitle}</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-1"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="p-4">
          <img
            src={imageUrl}
            alt={imageTitle}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
            onError={(e) => {
              console.error('Failed to load modal image:', imageUrl)
              e.currentTarget.src = '/placeholder-image.svg'
            }}
          />
        </div>
      </div>

      {/* Backdrop click to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  )
}