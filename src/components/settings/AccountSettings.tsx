'use client'

import { useState } from 'react'
import { Key, Download, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AccountSettings() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleChangePassword = () => {
    console.log('Change password')
    // TODO: Implement password change
  }

  const handleDownloadData = () => {
    console.log('Download data')
    // TODO: Implement data download
  }

  const handleDeleteAccount = () => {
    console.log('Delete account')
    // TODO: Implement account deletion
    setShowDeleteModal(false)
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Management</h3>
        
        <div className="space-y-6">
          {/* Change Password */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Key className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Password</h4>
                <p className="text-sm text-gray-500">Last changed 3 months ago</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleChangePassword}>
              Change Password
            </Button>
          </div>

          {/* Download Data */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Download className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Download Data</h4>
                <p className="text-sm text-gray-500">Export all your data and images</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleDownloadData}>
              Download Data
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Trash2 className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete your account? This action cannot be undone. 
                All your data, images, and settings will be permanently removed.
              </p>
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



