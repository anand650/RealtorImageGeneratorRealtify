'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onImageUploaded?: (imageId: string, imageUrl: string) => void
}

export function ImageUpload({ onImageUploaded }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageId, setImageId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 10MB.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Get upload URL
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const { imageId: newImageId, uploadUrl, key } = await response.json()
      setImageId(newImageId)

      // Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
        mode: 'cors', // Explicitly set CORS mode
      })

      if (!uploadResponse.ok) {
        if (uploadResponse.status === 403) {
          throw new Error('Upload URL expired. Please try again.')
        }
        throw new Error(`Failed to upload to S3: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Get the image with fresh pre-signed URL
      const imageResponse = await fetch(`/api/images/${newImageId}`)
      if (imageResponse.ok) {
        const imageData = await imageResponse.json()
        const imageUrl = imageData.image.originalUrl
        setUploadedImage(imageUrl)
        
        if (onImageUploaded) {
          onImageUploaded(newImageId, imageUrl)
        }
      } else {
        const errorText = await imageResponse.text()
        console.error('Failed to get image URL:', imageResponse.status, errorText)
        throw new Error('Failed to get image URL')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImageId(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Property Image</CardTitle>
        <CardDescription>
          Upload a high-quality image of the room you want to enhance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!uploadedImage ? (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400',
              uploading && 'pointer-events-none opacity-50'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              suppressHydrationWarning
            />
            
            {uploading ? (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-blue-600 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Uploading...</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    Drag and drop your image here
                  </p>
                  <p className="text-xs text-gray-500">
                    or click to browse files
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  suppressHydrationWarning
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded property"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
                suppressHydrationWarning
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <ImageIcon className="h-4 w-4" />
              <span>Image uploaded successfully</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}