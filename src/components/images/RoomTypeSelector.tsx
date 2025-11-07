'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Bed, 
  ChefHat, 
  Bath, 
  UtensilsCrossed, 
  Briefcase,
  TreePine 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoomTypeSelectorProps {
  onRoomTypeSelected?: (roomType: string) => void
  selectedRoomType?: string
}

const roomTypes = [
  { id: 'living_room', name: 'Living Room', icon: Home, description: 'Main living space' },
  { id: 'bedroom', name: 'Bedroom', icon: Bed, description: 'Sleeping quarters' },
  { id: 'kitchen', name: 'Kitchen', icon: ChefHat, description: 'Cooking and dining' },
  { id: 'bathroom', name: 'Bathroom', icon: Bath, description: 'Bath and shower' },
  { id: 'dining_room', name: 'Dining Room', icon: UtensilsCrossed, description: 'Formal dining' },
  { id: 'office', name: 'Office', icon: Briefcase, description: 'Home office space' },
  { id: 'outdoor', name: 'Outdoor', icon: TreePine, description: 'Patio or garden' },
]

export function RoomTypeSelector({ onRoomTypeSelected, selectedRoomType }: RoomTypeSelectorProps) {
  const [selected, setSelected] = useState(selectedRoomType || '')

  const handleSelect = (roomType: string) => {
    setSelected(roomType)
    if (onRoomTypeSelected) {
      onRoomTypeSelected(roomType)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Type</CardTitle>
        <CardDescription>
          Select the type of room you're enhancing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {roomTypes.map((room) => {
            const Icon = room.icon
            return (
              <Button
                key={room.id}
                variant={selected === room.id ? 'default' : 'outline'}
                className={cn(
                  'h-auto p-3 flex flex-col items-center space-y-2 min-h-[80px]',
                  selected === room.id && 'bg-blue-600 text-white'
                )}
                onClick={() => handleSelect(room.id)}
              >
                <Icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="text-sm font-medium">{room.name}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}