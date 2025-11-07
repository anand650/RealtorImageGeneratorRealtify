'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Home, Bed, ChefHat, Bath, UtensilsCrossed, Briefcase } from 'lucide-react'

interface RoomTypeBreakdownProps {
  data: Array<{
    roomType: string
    _count: number
  }>
}

const roomTypeIcons: Record<string, any> = {
  living_room: Home,
  bedroom: Bed,
  kitchen: ChefHat,
  bathroom: Bath,
  dining_room: UtensilsCrossed,
  office: Briefcase,
}

const roomTypeNames: Record<string, string> = {
  living_room: 'Living Room',
  bedroom: 'Bedroom',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  dining_room: 'Dining Room',
  office: 'Office',
}

export function RoomTypeBreakdown({ data }: RoomTypeBreakdownProps) {
  const total = data.reduce((sum, item) => sum + item._count, 0)
  
  // Sort by count descending
  const sortedData = [...data].sort((a, b) => b._count - a._count)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Type Breakdown</CardTitle>
        <CardDescription>
          Most popular room types you've enhanced
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedData.map((item) => {
          const Icon = roomTypeIcons[item.roomType] || Home
          const percentage = total > 0 ? (item._count / total) * 100 : 0
          
          return (
            <div key={item.roomType} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {roomTypeNames[item.roomType] || item.roomType}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {item._count} ({Math.round(percentage)}%)
                  </span>
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          )
        })}
        
        {data.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Home className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No room data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}