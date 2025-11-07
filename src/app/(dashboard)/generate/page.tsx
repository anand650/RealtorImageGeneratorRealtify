'use client'

import React, { useState } from 'react'
import { ImageUpload } from '@/components/images/ImageUpload'
import { RoomTypeSelector } from '@/components/images/RoomTypeSelector'
import { StyleSelector } from '@/components/images/StyleSelector'
import { ImageRefinement } from '@/components/images/ImageRefinement'
import { SimpleImageModal } from '@/components/images/SimpleImageModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function GeneratePage() {
  const [imageId, setImageId] = useState<string | null>(null)
  const [imageData, setImageData] = useState<any>(null)
  const [roomType, setRoomType] = useState<string>('')
  const [style, setStyle] = useState<string>('')
  const [initialRequirements, setInitialRequirements] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [imageHistory, setImageHistory] = useState<any[]>([])
  const [selectedImageForRefinement, setSelectedImageForRefinement] = useState<string | null>(null)
  const [processingStatus, setProcessingStatus] = useState<string>('')
  const [modalImage, setModalImage] = useState<{
    url: string
    title: string
    type: 'original' | 'enhanced' | 'refined'
    roomType?: string
    style?: string
  } | null>(null)
  const [processingProgress, setProcessingProgress] = useState<number>(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<{ message: string; code?: string } | null>(null)
  const [userInitialized, setUserInitialized] = useState<boolean>(true)
  const [usageInfo, setUsageInfo] = useState<any>(null)
  const [initializationError, setInitializationError] = useState<string | null>(null)
  const [previousImages, setPreviousImages] = useState<any[]>([])
  const [showImageSelector, setShowImageSelector] = useState(false)

  // Check usage on component mount (initialization is handled globally)
  React.useEffect(() => {
    const checkUsage = async () => {
      try {
        const response = await fetch('/api/usage')
        if (response.ok) {
          const data = await response.json()
          setUsageInfo(data)
        }
      } catch (error) {
        console.error('Usage check error:', error)
      }
    }
    checkUsage()
  }, [])

  // Load previous images for selection
  React.useEffect(() => {
    const loadPreviousImages = async () => {
      try {
        const response = await fetch('/api/images?limit=10')
        if (response.ok) {
          const data = await response.json()
          // Filter to only show images that have been uploaded (have originalUrl)
          const validImages = (data.images || []).filter((img: any) => img.originalUrl)
          setPreviousImages(validImages)
        }
      } catch (error) {
        console.error('Failed to load previous images:', error)
      }
    }
    loadPreviousImages()
  }, [])

  const handleImageUploaded = async (uploadedImageId: string, uploadedImageUrl: string) => {
    setImageId(uploadedImageId)
    
    // Fetch the image data with fresh pre-signed URLs
    try {
      const response = await fetch(`/api/images/${uploadedImageId}`)
      if (response.ok) {
        const data = await response.json()
        setImageData(data.image)
      }
    } catch (error) {
      console.error('Failed to fetch image data:', error)
    }
  }

  const handleRefinementComplete = async (refinedImageId: string, refinedImageUrl: string) => {
    // Fetch the refined image data
    try {
      const response = await fetch(`/api/images/${refinedImageId}`)
      if (response.ok) {
        const data = await response.json()
        
        // Add current image to history before switching
        if (imageData) {
          setImageHistory(prev => [...prev, { ...imageData, timestamp: new Date() }])
        }
        
        setImageData(data.image)
        setImageId(refinedImageId)
        setSelectedImageForRefinement(refinedImageId) // Auto-select new image for next refinement
        
        // Show success message
        setResult({ success: true, message: 'Image refined successfully!' })
      }
    } catch (error) {
      console.error('Failed to fetch refined image data:', error)
    }
  }

  const handleRoomTypeSelected = (selectedRoomType: string) => {
    setRoomType(selectedRoomType)
  }

  const handleStyleSelected = (selectedStyle: string) => {
    setStyle(selectedStyle)
  }

  const handleGenerate = async () => {
    if (!imageId) {
      alert('Please upload an image to proceed.')
      return
    }

    setProcessing(true)
    setProcessingStatus('Starting AI image processing...')
    setProcessingProgress(0)
    setError(null) // Clear any previous errors

    try {
      // Show progress updates
      setProcessingStatus('Analyzing room layout...')
      setProcessingProgress(20)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProcessingStatus('Generating enhanced design...')
      setProcessingProgress(50)
      
      const response = await fetch('/api/images/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          // roomType and style are optional; only send if provided
          ...(roomType ? { roomType } : {}),
          ...(style ? { style } : {}),
          clientNotes: initialRequirements,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }))
        console.error('API Error:', response.status, errorData)
        
        // Handle specific error cases
        if (response.status === 404 && errorData.error === 'User not found') {
          throw new Error('Please refresh the page and try again. Your account may need to be initialized.')
        }
        
        throw new Error(errorData.error || errorData.details || `Server error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      
      // Show user-friendly error messages
      if (!data.success && data.result?.error) {
        const error = data.result.error
        if (error.includes('mismatch') || error.includes('Room type')) {
          setError(new Error('Room type mismatch: Please select the correct room type that matches your uploaded image (e.g., "Living Room" for living room images).'))
        } else if (error.includes('quota') || error.includes('limit')) {
          setError(new Error('Usage limit reached: You\'ve used all your monthly image generations. Please upgrade your plan or try again next month.'))
        } else if (error.includes('AI generation failed')) {
          setError(new Error('AI generation failed: The AI couldn\'t process this image. Please try with a different image or check if the image is clear and appropriate.'))
        } else {
          setError(new Error(error))
        }
        return
      }
        
      if (data.success && data.result?.status === 'completed') {
        setProcessingStatus('Finalizing enhanced image...')
        setProcessingProgress(90)
        
        // Refresh image data to get the processed image
            if (imageId) {
              const imageResponse = await fetch(`/api/images/${imageId}`)
              if (imageResponse.ok) {
                const imageData = await imageResponse.json()
                setImageData(imageData.image)
                setProcessingStatus('Processing completed successfully!')
                setProcessingProgress(100)
                
                // Refresh usage info
                const usageResponse = await fetch('/api/usage')
                if (usageResponse.ok) {
                  const usageData = await usageResponse.json()
                  setUsageInfo(usageData)
                }

                // Scroll to results section after a short delay
                setTimeout(() => {
                  const resultsSection = document.getElementById('results-section')
                  if (resultsSection) {
                    resultsSection.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    })
                  }
                }, 500)
              }
            }
      } else {
        // Handle AI processing failure
        setError({
          message: data.result?.error || data.message || 'AI image generation failed',
          code: data.result?.errorCode || 'UNKNOWN_ERROR'
        })
        setProcessingStatus('AI processing failed')
        setProcessingProgress(0)
      }
    } catch (error) {
      console.error('Processing error:', error)
      setError({
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'NETWORK_ERROR'
      })
      setProcessingStatus('Network error occurred')
      setProcessingProgress(0)
    } finally {
      setProcessing(false)
    }
  }

  const canGenerate = Boolean(imageId) && !processing && userInitialized


  return (
    <div className="h-full flex flex-col">
      {/* Page Header - Compact */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-luxury-900">AI Image Generator</h1>
        <p className="text-luxury-600">
          Transform your property images with AI-powered enhancements
        </p>
      </div>

      {/* Main content */}
      <div className="space-y-6">
        {/* Upload and Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Image Upload */}
          <div className="space-y-4 lg:space-y-6">
            <ImageUpload onImageUploaded={handleImageUploaded} />
            
            {/* Previous Images Selector */}
            {previousImages.length > 0 && (
              <Card className="card-luxury">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Or Select Previous Image</CardTitle>
                  <CardDescription className="text-sm">
                    Choose from your previously uploaded images
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {previousImages.map((prevImage) => {
                      // Use processedUrl if available (enhanced image), otherwise originalUrl
                      const imageUrl = prevImage.processedUrl || prevImage.originalUrl || '/placeholder-image.svg'
                      
                      return (
                        <button
                          key={prevImage.id}
                          onClick={() => {
                            setImageId(prevImage.id)
                            setImageData(prevImage)
                            setShowImageSelector(false)
                          }}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            imageId === prevImage.id
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt="Previous image"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.currentTarget.src = '/placeholder-image.svg'
                            }}
                          />
                          {imageId === prevImage.id && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Requirements */}
            <Card className="card-luxury">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Specific Requirements (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <textarea
                  className="w-full h-20 rounded-lg border border-luxury-200 bg-luxury-50/50 px-3 py-2 text-sm placeholder:text-luxury-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                  placeholder="e.g., Add a large sectional sofa, warm lighting, plants in corners..."
                  value={initialRequirements}
                  onChange={(e) => setInitialRequirements(e.target.value)}
                  disabled={processing}
                />
              </CardContent>
            </Card>
          </div>

          {/* Room Type & Style Selectors */}
          <div className="space-y-4">
            <div className="min-h-[180px] lg:min-h-[200px]">
              <RoomTypeSelector 
                onRoomTypeSelected={handleRoomTypeSelected}
                selectedRoomType={roomType}
              />
            </div>
            <div className="min-h-[180px] lg:min-h-[200px]">
              <StyleSelector
                onStyleSelected={handleStyleSelected}
                selectedStyle={style}
                roomType={roomType}
              />
            </div>
          </div>
        </div>

        {/* Generate Button - Full Width */}
        <div className="w-full">
          <Card className="card-luxury-gradient">
            <CardContent className="p-6">
              <div className="max-w-md mx-auto">
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="w-full btn-gold h-12 text-base font-semibold"
                  size="lg"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  {processing ? 'Processing...' : 'Generate Image'}
                </Button>
                
                {processing && (
                  <div className="mt-4 space-y-2">
                    <Progress value={processingProgress} className="w-full h-2" />
                    <p className="text-sm text-luxury-600 text-center">{processingStatus}</p>
                  </div>
                )}

                {result && result.success && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Success!</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Error</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">{error.message}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section - Scroll target */}
        {(imageData || result) && (
          <div id="results-section" className="space-y-4">
            <h3 className="text-lg font-semibold text-luxury-900">Generated Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {imageData && (
                <div className="card-luxury p-4">
                  <h4 className="font-medium text-luxury-900 mb-3">Original Image</h4>
                  <div className="relative group cursor-pointer" onClick={() => setModalImage({
                    url: imageData.originalUrl,
                    title: 'Original Image',
                    type: 'original'
                  })}>
                    <img
                      src={imageData.originalUrl}
                      alt="Original"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white/90 rounded-full p-2">
                          <Zap className="h-5 w-5 text-luxury-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {imageData?.processedUrl && (
                <div className="card-luxury p-4">
                  <h4 className="font-medium text-luxury-900 mb-3">Enhanced Image</h4>
                  <div className="relative group cursor-pointer" onClick={() => setModalImage({
                    url: imageData.processedUrl,
                    title: 'Enhanced Image',
                    type: 'enhanced',
                    roomType,
                    style
                  })}>
                    <img
                      src={imageData.processedUrl}
                      alt="Enhanced"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white/90 rounded-full p-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-luxury-600">
                    {roomType} • {style}
                  </div>
                </div>
              )}

              {!imageData?.processedUrl && result && result.success && result.result?.processedUrl && (
                <div className="card-luxury p-4">
                  <h4 className="font-medium text-luxury-900 mb-3">Enhanced Image</h4>
                  <div className="relative group cursor-pointer" onClick={() => setModalImage({
                    url: result.result.processedUrl,
                    title: 'Enhanced Image',
                    type: 'enhanced',
                    roomType,
                    style
                  })}>
                    <img
                      src={result.result.processedUrl}
                      alt="Enhanced"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white/90 rounded-full p-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-luxury-600">
                    {roomType} • {style}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Continuous Improvement Section */}
        {(imageData?.processedUrl || (result && result.success && result.result?.processedUrl)) && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-luxury-900">Continuous Improvement</h3>
            
            {/* Refinement History */}
            {imageHistory.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-base font-medium text-luxury-800">Refinement History</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imageHistory.map((refinedImage, index) => (
                    <div key={refinedImage.id} className="card-luxury p-3">
                      <div className="relative group cursor-pointer" onClick={() => setModalImage({
                        url: refinedImage.processedUrl,
                        title: `Refined Version ${index + 1}`,
                        type: 'refined',
                        roomType,
                        style
                      })}>
                        <img
                          src={refinedImage.processedUrl}
                          alt={`Refined ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-white/90 rounded-full p-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-luxury-600">
                        Refined Version {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refinement Controls */}
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="text-base">Refine Your Image</CardTitle>
                <CardDescription>
                  Not satisfied with the result? Provide feedback and let AI improve it further.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageRefinement
                  imageId={selectedImageForRefinement || imageId || ''}
                  onRefinementComplete={handleRefinementComplete}
                  disabled={processing}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {modalImage && (
        <SimpleImageModal
          isOpen={!!modalImage}
          onClose={() => setModalImage(null)}
          imageUrl={modalImage.url}
          imageTitle={modalImage.title}
        />
      )}
    </div>
  )
}