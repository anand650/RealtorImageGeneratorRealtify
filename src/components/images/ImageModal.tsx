'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download, Share2, X, Copy, Facebook, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  imageTitle?: string
  imageType?: 'original' | 'enhanced' | 'refined'
  roomType?: string
  style?: string
}

export function ImageModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  imageTitle, 
  imageType = 'enhanced',
  roomType,
  style 
}: ImageModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      
      // Fetch the image
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10)
      const filename = `${roomType || 'room'}-${style || 'enhanced'}-${timestamp}.jpg`
      link.download = filename
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download image. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert('Failed to copy link. Please try again.')
    }
  }

  const handleShare = (platform: string) => {
    const shareText = `Check out this AI-enhanced ${roomType || 'room'} design!`
    const shareUrl = window.location.href
    
    let url = ''
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
        break
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
    setShowShareMenu(false)
  }

  const getImageTypeLabel = () => {
    switch (imageType) {
      case 'original': return 'Original Image'
      case 'enhanced': return 'AI Enhanced Image'
      case 'refined': return 'Refined Image'
      default: return 'Image'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden flex flex-col">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {imageTitle || getImageTypeLabel()}
                </DialogTitle>
                {(roomType || style) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {roomType && <span className="capitalize">{roomType.replace('_', ' ')}</span>}
                    {roomType && style && ' • '}
                    {style && <span className="capitalize">{style}</span>}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Image Container */}
          <div className="flex-1 relative bg-gray-50 flex items-center justify-center p-4">
            <img
              src={imageUrl}
              alt={imageTitle || getImageTypeLabel()}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              onError={(e) => {
                console.error('Failed to load image in modal:', imageUrl)
                e.currentTarget.src = '/placeholder-image.svg'
              }}
            />
          </div>

          {/* Action Bar */}
          <div className="px-6 py-4 border-t bg-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>

                {/* Share Menu */}
                {showShareMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 min-w-[200px] z-50">
                    <div className="space-y-1">
                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      >
                        <Copy className="h-4 w-4" />
                        <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                      
                      <div className="border-t my-1"></div>
                      
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      >
                        <Facebook className="h-4 w-4" />
                        <span>Facebook</span>
                      </button>
                      
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      >
                        <Twitter className="h-4 w-4" />
                        <span>Twitter</span>
                      </button>
                      
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span>LinkedIn</span>
                      </button>
                      
                      <button
                        onClick={() => handleShare('email')}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Click outside to close
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
