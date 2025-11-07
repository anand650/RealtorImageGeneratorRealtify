'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StyleSelectorProps {
  onStyleSelected?: (style: string) => void
  selectedStyle?: string
  roomType?: string
}

const styles = [
  { id: 'modern', name: 'Modern', description: 'Clean, contemporary design' },
  { id: 'traditional', name: 'Traditional', description: 'Classic, timeless style' },
  { id: 'luxury', name: 'Luxury', description: 'High-end, premium materials' },
  { id: 'cozy', name: 'Cozy', description: 'Warm, comfortable atmosphere' },
  { id: 'minimalist', name: 'Minimalist', description: 'Simple, uncluttered space' },
  { id: 'rustic', name: 'Rustic', description: 'Natural, country-inspired' },
  { id: 'industrial', name: 'Industrial', description: 'Urban, raw materials' },
  { id: 'scandinavian', name: 'Scandinavian', description: 'Nordic, hygge-inspired' },
]

export function StyleSelector({ onStyleSelected, selectedStyle, roomType }: StyleSelectorProps) {
  const [selected, setSelected] = useState(selectedStyle || '')

  const handleSelect = (style: string) => {
    setSelected(style)
    if (onStyleSelected) {
      onStyleSelected(style)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Design Style</CardTitle>
        <CardDescription>
          Choose the design style for your {roomType?.replace('_', ' ') || 'room'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {styles.map((style) => (
            <Button
              key={style.id}
              variant={selected === style.id ? 'default' : 'outline'}
              className={cn(
                'h-auto p-3 flex flex-col items-center space-y-2 min-h-[70px]',
                selected === style.id && 'bg-blue-600 text-white'
              )}
              onClick={() => handleSelect(style.id)}
            >
              <div className="font-medium text-sm">{style.name}</div>
              <div className="text-xs opacity-70 text-center leading-tight">{style.description}</div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}