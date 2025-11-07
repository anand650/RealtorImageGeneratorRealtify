import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { AccountSettings } from '@/components/settings/AccountSettings'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProfileSettings />
        <NotificationSettings />
      </div>

      <AccountSettings />
    </div>
  )
}



