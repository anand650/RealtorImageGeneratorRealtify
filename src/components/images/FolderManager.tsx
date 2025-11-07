'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Folder, FolderPlus, Edit, Trash2, ChevronRight } from 'lucide-react'

interface ImageFolder {
  id: string
  name: string
  description?: string
  parentFolderId?: string
  subFolders?: ImageFolder[]
  imageCount?: number
}

interface FolderManagerProps {
  folders: ImageFolder[]
  currentFolderId?: string
  onFolderSelect: (folderId: string | null) => void
  onFolderCreate: (name: string, description?: string, parentId?: string) => void
  onFolderUpdate: (id: string, name: string, description?: string) => void
  onFolderDelete: (id: string) => void
  loading?: boolean
  unassignedCount?: number
  totalCount?: number
}

export function FolderManager({
  folders,
  currentFolderId,
  onFolderSelect,
  onFolderCreate,
  onFolderUpdate,
  onFolderDelete,
  loading,
  unassignedCount,
  totalCount
}: FolderManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<ImageFolder | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDescription, setNewFolderDescription] = useState('')

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onFolderCreate(newFolderName.trim(), newFolderDescription.trim() || undefined, currentFolderId)
      setNewFolderName('')
      setNewFolderDescription('')
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditFolder = () => {
    if (editingFolder && newFolderName.trim()) {
      onFolderUpdate(editingFolder.id, newFolderName.trim(), newFolderDescription.trim() || undefined)
      setEditingFolder(null)
      setNewFolderName('')
      setNewFolderDescription('')
      setIsEditDialogOpen(false)
    }
  }

  const openEditDialog = (folder: ImageFolder) => {
    setEditingFolder(folder)
    setNewFolderName(folder.name)
    setNewFolderDescription(folder.description || '')
    setIsEditDialogOpen(true)
  }

  const renderFolderTree = (folderList: ImageFolder[], level = 0) => {
    return folderList.map((folder) => (
      <div key={folder.id} className="space-y-1">
        <div
          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
            currentFolderId === folder.id
              ? 'bg-blue-50 border border-blue-200'
              : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <div
            className="flex items-center space-x-2 flex-1"
            onClick={() => onFolderSelect(folder.id)}
          >
            <Folder className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">{folder.name}</span>
            {folder.imageCount !== undefined && (
              <span className="text-xs text-gray-500">({folder.imageCount})</span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                openEditDialog(folder)
              }}
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onFolderDelete(folder.id)
              }}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {folder.subFolders && folder.subFolders.length > 0 && (
          <div>
            {renderFolderTree(folder.subFolders, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Folders</CardTitle>
            <CardDescription>Organize your images</CardDescription>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Create a new folder to organize your images.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Folder Name</label>
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Input
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                    placeholder="Enter folder description"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                  Create Folder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {/* All Images option */}
          <div
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              !currentFolderId
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onFolderSelect(null)}
          >
            <div className="flex items-center">
              <Folder className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium">All Images</span>
            </div>
            {typeof totalCount === 'number' && (
              <span className="text-xs text-gray-500">({totalCount})</span>
            )}
          </div>

          {/* Uploaded (all user images) virtual folder */}
          <div
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              currentFolderId === '__UPLOADED__'
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onFolderSelect('__UPLOADED__')}
          >
            <div className="flex items-center">
              <Folder className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium">Uploaded</span>
            </div>
            {typeof unassignedCount === 'number' && (
              <span className="text-xs text-gray-500">({unassignedCount})</span>
            )}
          </div>
          
          {/* Folder tree */}
          {loading ? (
            <div className="animate-pulse space-y-2 py-2">
              <div className="h-4 bg-gray-100 rounded" />
              <div className="h-4 bg-gray-100 rounded" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ) : folders.length > 0 ? (
            renderFolderTree(folders)
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No folders yet</p>
              <p className="text-xs">Create your first folder to organize images</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>
              Update the folder name and description.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Folder Name</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Enter folder description"
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFolder} disabled={!newFolderName.trim()}>
              Update Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
