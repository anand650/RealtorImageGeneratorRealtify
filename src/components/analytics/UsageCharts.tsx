'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface UsageChartsProps {
  dailyData: Array<{
    date: string
    count: number
    completed: number
    failed: number
  }>
  styleData: Array<{
    style: string
    _count: number
  }>
}

const styleNames: Record<string, string> = {
  modern: 'Modern',
  traditional: 'Traditional',
  luxury: 'Luxury',
  cozy: 'Cozy',
  minimalist: 'Minimalist',
  rustic: 'Rustic',
  industrial: 'Industrial',
  scandinavian: 'Scandinavian',
}

export function UsageCharts({ dailyData, styleData }: UsageChartsProps) {
  const maxDailyCount = Math.max(...dailyData.map(d => d.count), 1)
  const totalStyles = styleData.reduce((sum, item) => sum + item._count, 0)
  
  // Sort style data by count
  const sortedStyles = [...styleData].sort((a, b) => b._count - a._count)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Daily Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Usage</CardTitle>
          <CardDescription>
            Images generated per day (last {dailyData.length} days)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyData.map((day) => {
              const percentage = (day.count / maxDailyCount) * 100
              const successRate = day.count > 0 ? (day.completed / day.count) * 100 : 0
              
              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="text-muted-foreground">
                      {day.count} images
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={percentage} className="h-2" />
                    {day.failed > 0 && (
                      <div className="absolute top-0 left-0 h-2 bg-red-500 rounded-full" 
                           style={{ width: `${(day.failed / day.count) * percentage}%` }} />
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{day.completed} completed</span>
                    {day.failed > 0 && <span>{day.failed} failed</span>}
                  </div>
                </div>
              )
            })}
            
            {dailyData.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No usage data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Style Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Style Preferences</CardTitle>
          <CardDescription>
            Your most used design styles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedStyles.map((item) => {
            const percentage = totalStyles > 0 ? (item._count / totalStyles) * 100 : 0
            
            return (
              <div key={item.style} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {styleNames[item.style] || item.style}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item._count} ({Math.round(percentage)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
          
          {styleData.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No style data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
