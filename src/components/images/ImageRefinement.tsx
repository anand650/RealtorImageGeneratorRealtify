'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Zap, MessageSquare, Palette, Lightbulb, Sofa, AlertCircle, CheckCircle } from 'lucide-react'

interface ImageRefinementProps {
  imageId: string
  onRefinementComplete?: (refinedImageId: string, imageUrl: string) => void
  disabled?: boolean
}

interface RefinementRequest {
  colors?: string
  furniture?: string
  lighting?: string
  style?: string
  other?: string
}

export function ImageRefinement({ imageId, onRefinementComplete, disabled }: ImageRefinementProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState('')
  const [userFeedback, setUserFeedback] = useState('')
  const [specificRequests, setSpecificRequests] = useState<RefinementRequest>({})
  const [error, setError] = useState<{ message: string; code?: string } | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRefinementSubmit = async () => {
    if (!userFeedback.trim()) {
      setError({ message: 'Please provide feedback about what you\'d like to change.' })
      return
    }

    setProcessing(true)
    setProcessingProgress(0)
    setProcessingStatus('Starting image refinement...')
    setError(null)
    setSuccess(false)

    try {
      // Show progress updates
      setProcessingStatus('Analyzing your feedback...')
      setProcessingProgress(20)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProcessingStatus('Generating refined image with AI...')
      setProcessingProgress(50)

      const response = await fetch('/api/images/refine-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          userFeedback,
          specificRequests: Object.fromEntries(
            Object.entries(specificRequests).filter(([_, value]) => value?.trim())
          ),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }))
        throw new Error(errorData.error || errorData.details || `Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.result?.status === 'completed') {
        setProcessingStatus('Finalizing refined image...')
        setProcessingProgress(90)
        
        // Get the refined image data
        if (data.refinedImageId) {
          const imageResponse = await fetch(`/api/images/${data.refinedImageId}`)
          if (imageResponse.ok) {
            const imageData = await imageResponse.json()
            setProcessingStatus('Refinement completed successfully!')
            setProcessingProgress(100)
            setSuccess(true)
            
            // Notify parent component
            if (onRefinementComplete && imageData.image.processedUrl) {
              onRefinementComplete(data.refinedImageId, imageData.image.processedUrl)
            }
            
            // Reset form after success
            setTimeout(() => {
              setUserFeedback('')
              setSpecificRequests({})
              setIsOpen(false)
              setSuccess(false)
            }, 2000)
          }
        }
      } else {
        // Handle AI processing failure
        setError({
          message: data.result?.error || 'AI refinement failed',
          code: data.result?.errorCode || 'UNKNOWN_ERROR'
        })
        setProcessingStatus('Refinement failed')
        setProcessingProgress(0)
      }
    } catch (error) {
      console.error('Refinement error:', error)
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

  if (!isOpen) {
    return (
      <div className="mt-4">
        <Button
          onClick={() => setIsOpen(true)}
          disabled={disabled || processing}
          variant="outline"
          className="w-full"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Refine This Image
        </Button>
      </div>
    )
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Refine Your Image
        </CardTitle>
        <CardDescription>
          Tell us what you'd like to change, and we'll generate an improved version.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main feedback */}
        <div>
          <label className="text-sm font-medium text-gray-900 mb-2 block">
            What would you like to change?
          </label>
          <Textarea
            placeholder="e.g., Make the room brighter, add more modern furniture, change the color scheme to warmer tones..."
            value={userFeedback}
            onChange={(e) => setUserFeedback(e.target.value)}
            disabled={processing}
            rows={3}
          />
        </div>

        {/* Specific requests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Palette className="mr-1 h-3 w-3" />
              Colors
            </label>
            <Input
              placeholder="e.g., warmer tones, blue accents"
              value={specificRequests.colors || ''}
              onChange={(e) => setSpecificRequests(prev => ({ ...prev, colors: e.target.value }))}
              disabled={processing}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Sofa className="mr-1 h-3 w-3" />
              Furniture
            </label>
            <Input
              placeholder="e.g., add a coffee table, modern sofa"
              value={specificRequests.furniture || ''}
              onChange={(e) => setSpecificRequests(prev => ({ ...prev, furniture: e.target.value }))}
              disabled={processing}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Lightbulb className="mr-1 h-3 w-3" />
              Lighting
            </label>
            <Input
              placeholder="e.g., brighter, more natural light"
              value={specificRequests.lighting || ''}
              onChange={(e) => setSpecificRequests(prev => ({ ...prev, lighting: e.target.value }))}
              disabled={processing}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Zap className="mr-1 h-3 w-3" />
              Style
            </label>
            <Input
              placeholder="e.g., more minimalist, add plants"
              value={specificRequests.style || ''}
              onChange={(e) => setSpecificRequests(prev => ({ ...prev, style: e.target.value }))}
              disabled={processing}
            />
          </div>
        </div>

        {/* Processing status */}
        {processing && (
          <div className="space-y-2">
            <Progress value={processingProgress} className="w-full" />
            <p className="text-sm text-gray-600">{processingStatus}</p>
            <p className="text-xs text-gray-500">{processingProgress}% complete</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Refinement completed!</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Your refined image is ready to view.
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Refinement Failed</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {error.message}
            </p>
            {error.code && (
              <p className="text-xs text-red-500 mt-1">
                Error Code: {error.code}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            onClick={handleRefinementSubmit}
            disabled={processing || !userFeedback.trim()}
            className="flex-1"
          >
            <Zap className="mr-2 h-4 w-4" />
            {processing ? 'Refining...' : 'Generate Refined Image'}
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false)
              setError(null)
              setSuccess(false)
            }}
            variant="outline"
            disabled={processing}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
