"use client"
import { TeamMembers } from '@/components/team/TeamMembers'
import { InviteMember } from '@/components/team/InviteMember'

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your team members and their permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TeamMembers />
        </div>
        <div className="lg:col-span-1">
          <InviteMember />
        </div>
      </div>
    </div>
  )
}



