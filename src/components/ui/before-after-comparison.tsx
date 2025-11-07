'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BeforeAfterImage {
  before: string
  after: string
  title?: string
  description?: string
}

interface BeforeAfterComparisonProps {
  images: BeforeAfterImage[]
}

export function BeforeAfterComparison({ images }: BeforeAfterComparisonProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentImage = images[currentIndex]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging])

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setSliderPosition(50)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setSliderPosition(50)
  }

  return (
    <div className="relative w-full">
      {/* Image Comparison Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl cursor-col-resize group"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* After Image (Background - Enhanced version) */}
        <div className="absolute inset-0">
          <img
            src={currentImage.after}
            alt="Before"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.svg'
            }}
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Before Image (Clipped - Original version) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={currentImage.before}
            alt="After"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.svg'
            }}
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-white via-white to-white shadow-2xl z-10 transition-all duration-100"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-white group-hover:scale-110 transition-transform duration-300">
            <div className="flex space-x-1.5">
              <div className="w-0.5 h-7 bg-white rounded-full"></div>
              <div className="w-0.5 h-7 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-6 left-6 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-md text-white px-5 py-2.5 rounded-xl font-bold text-sm z-20 border border-white/20 shadow-lg">
          Before
        </div>
        <div className="absolute top-6 right-6 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-md text-white px-5 py-2.5 rounded-xl font-bold text-sm z-20 border border-white/20 shadow-lg">
          After
        </div>

        {/* Touch Support */}
        <div
          className="absolute inset-0 z-10 md:hidden"
          onTouchMove={(e) => {
            if (!containerRef.current) return
            const touch = e.touches[0]
            const rect = containerRef.current.getBoundingClientRect()
            const x = touch.clientX - rect.left
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
            setSliderPosition(percentage)
          }}
        />
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={prevImage}
            className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 text-luxury-700 hover:text-gold-600 border border-luxury-200"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Image Indicators */}
          <div className="flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setSliderPosition(50)
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-gold-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextImage}
            className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 text-luxury-700 hover:text-gold-600 border border-luxury-200"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Image Info */}
      {currentImage.title && (
        <div className="mt-4 text-center">
          <h4 className="text-lg font-semibold text-luxury-900">{currentImage.title}</h4>
          {currentImage.description && (
            <p className="text-sm text-luxury-600 mt-1">{currentImage.description}</p>
          )}
        </div>
      )}
    </div>
  )
}

