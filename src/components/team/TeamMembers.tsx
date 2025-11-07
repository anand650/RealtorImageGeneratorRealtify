'use client'

import { useEffect, useMemo, useState } from 'react'
import { User, Mail, Shield, MoreHorizontal, Trash2, Edit, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type MemberRole = 'OWNER' | 'MEMBER' | 'VIEWER'
type Member = { id: string; email: string; firstName?: string | null; lastName?: string | null; role: MemberRole; createdAt: string }

export function TeamMembers() {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<MemberRole | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [ownerCount, setOwnerCount] = useState(0)

  const refreshMembers = async () => {
    try {
      const res = await fetch('/api/teams/members', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
        if (data.currentUser) {
          setCurrentUserRole(data.currentUser.role)
          setCurrentUserId(data.currentUser.id)
        }
        setOwnerCount(data.ownerCount || 0)
        return true
      }
    } catch (error) {
      console.error('Failed to refresh team members', error)
    }
    return false
  }

  useEffect(() => {
    const load = async () => {
      await refreshMembers()
      setLoading(false)
    }
    load()
  }, [])

  const canManage = currentUserRole === 'OWNER'

  const orderedMembers = useMemo(() => {
    const priority: Record<MemberRole, number> = { OWNER: 0, MEMBER: 1, VIEWER: 2 }
    return [...members].sort((a, b) => {
      const byRole = priority[a.role] - priority[b.role]
      if (byRole !== 0) return byRole
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }, [members])

  const toggleMemberSelection = (memberId: string) => {
    if (!canManage) return
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleEditMember = async (memberId: string) => {
    if (!canManage) {
      alert('Only owners can update roles.')
      return
    }
    const target = members.find(m => m.id === memberId)
    if (!target) return
    const role = prompt('Enter role (OWNER, MEMBER, VIEWER):', target.role)
    if (!role) return
    const nextRole = role.toUpperCase() as MemberRole
    if (!['OWNER', 'MEMBER', 'VIEWER'].includes(nextRole)) {
      alert('Invalid role. Choose OWNER, MEMBER, or VIEWER.')
      return
    }
    if (target.role === 'OWNER' && nextRole !== 'OWNER' && ownerCount <= 1) {
      alert('Assign another owner before downgrading the last owner.')
      return
    }
    await fetch(`/api/teams/members/${memberId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: nextRole }) })
    await refreshMembers()
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!canManage) {
      alert('Only owners can remove members.')
      return
    }
    const target = members.find(m => m.id === memberId)
    if (!target) return
    if (target.role === 'OWNER' && ownerCount <= 1) {
      alert('Transfer ownership before removing the last owner.')
      return
    }
    if (!confirm('Remove this member from the team?')) return
    await fetch(`/api/teams/members/${memberId}`, { method: 'DELETE' })
    setSelectedMembers(prev => prev.filter(id => id !== memberId))
    await refreshMembers()
  }

  const getRoleColor = (role: MemberRole) => {
    switch (role) {
      case 'OWNER':
        return 'bg-red-100 text-red-800'
      case 'MEMBER':
        return 'bg-blue-100 text-blue-800'
      case 'VIEWER':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 space-y-4">
        {!canManage && (
          <div className="flex items-start space-x-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>
              You are a {currentUserRole?.toLowerCase() || 'team member'} with read-only access. Only owners can change roles or remove members.
            </span>
          </div>
        )}

        {canManage && ownerCount <= 1 && (
          <div className="flex items-start space-x-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>
              You currently have {ownerCount} owner{ownerCount === 1 ? '' : 's'}. Promote another member before handing off billing access.
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
          {selectedMembers.length > 0 && canManage && (
            <Button variant="destructive" size="sm" onClick={() => selectedMembers.forEach(handleRemoveMember)}>
              Remove Selected ({selectedMembers.length})
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={!canManage}
                      onChange={(event) => {
                        if (!canManage) return
                        if (event.target.checked) {
                          setSelectedMembers(orderedMembers.map(m => m.id).filter(id => id !== currentUserId))
                        } else {
                          setSelectedMembers([])
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(!loading ? orderedMembers : []).map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleMemberSelection(member.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={!canManage || member.id === currentUserId}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {(member.firstName || member.lastName)
                              ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                              : member.email.split('@')[0]}
                            {member.id === currentUserId && (
                              <span className="ml-2 text-xs text-gray-400">(you)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor('active')}`}>
                        active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      —
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditMember(member.id)}
                          className={`text-blue-600 ${canManage ? 'hover:text-blue-900' : 'opacity-40 cursor-not-allowed'}`}
                          disabled={!canManage}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className={`text-red-600 ${canManage ? 'hover:text-red-900' : 'opacity-40 cursor-not-allowed'}`}
                          disabled={!canManage || member.id === currentUserId}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600" disabled>
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading members…' : `Showing ${members.length} team member${members.length === 1 ? '' : 's'}`}
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Export Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}



