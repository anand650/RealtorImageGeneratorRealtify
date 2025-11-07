'use client'

import { useState } from 'react'
import { Bell, Mail, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: {
      processingComplete: true,
      tokenWarning: true,
      billingAlerts: true,
      securityAlerts: true,
    },
    push: {
      processingComplete: false,
      tokenWarning: true,
      billingAlerts: false,
      securityAlerts: true,
    },
    sms: {
      tokenWarning: false,
      billingAlerts: false,
      securityAlerts: true,
    },
  })

  const handleToggle = (category: string, type: string) => {
    setNotifications(prev => {
      const categoryKey = category as keyof typeof prev
      const typeKey = type as keyof typeof prev[typeof categoryKey]
      
      return {
        ...prev,
        [category]: {
          ...prev[categoryKey],
          [type]: !prev[categoryKey][typeKey],
        },
      }
    })
  }

  const handleSave = () => {
    console.log('Save notification settings:', notifications)
    // TODO: Implement save logic
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-6">
          {/* Email Notifications */}
          <div>
            <div className="flex items-center mb-3">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
            </div>
            <div className="space-y-3">
              {Object.entries(notifications.email).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleToggle('email', key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Push Notifications */}
          <div>
            <div className="flex items-center mb-3">
              <Bell className="h-5 w-5 text-gray-400 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
            </div>
            <div className="space-y-3">
              {Object.entries(notifications.push).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleToggle('push', key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* SMS Notifications */}
          <div>
            <div className="flex items-center mb-3">
              <Smartphone className="h-5 w-5 text-gray-400 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
            </div>
            <div className="space-y-3">
              {Object.entries(notifications.sms).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleToggle('sms', key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  )
}



