'use client'

import { 
  Eye, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Download,
  Share,
  Archive,
  MoreHorizontal
} from 'lucide-react'
import ActionMenu from './ActionMenu'

// Example usage of ActionMenu component for different project listings

export function EmployeeActionsExample() {
  const handleView = (id: string) => console.log('View employee:', id)
  const handleEdit = (id: string) => console.log('Edit employee:', id)
  const handleDelete = (id: string) => console.log('Delete employee:', id)

  return (
    <ActionMenu
      items={[
        {
          label: 'View',
          icon: <Eye size={18} />,
          onClick: () => handleView('employee-id'),
          color: 'primary'
        },
        {
          label: 'Edit',
          icon: <EditIcon size={18} />,
          onClick: () => handleEdit('employee-id'),
          color: 'primary'
        },
        {
          label: 'Delete',
          icon: <DeleteIcon size={18} />,
          onClick: () => handleDelete('employee-id'),
          color: 'error'
        }
      ]}
    />
  )
}

export function ProjectActionsExample() {
  const handleView = (id: string) => console.log('View project:', id)
  const handleEdit = (id: string) => console.log('Edit project:', id)
  const handleDownload = (id: string) => console.log('Download project:', id)
  const handleShare = (id: string) => console.log('Share project:', id)
  const handleArchive = (id: string) => console.log('Archive project:', id)
  const handleDelete = (id: string) => console.log('Delete project:', id)

  return (
    <ActionMenu
      items={[
        {
          label: 'View',
          icon: <Eye size={18} />,
          onClick: () => handleView('project-id'),
          color: 'primary'
        },
        {
          label: 'Edit',
          icon: <EditIcon size={18} />,
          onClick: () => handleEdit('project-id'),
          color: 'primary'
        },
        {
          label: 'Download',
          icon: <Download size={18} />,
          onClick: () => handleDownload('project-id'),
          color: 'secondary'
        },
        {
          label: 'Share',
          icon: <Share size={18} />,
          onClick: () => handleShare('project-id'),
          color: 'info'
        },
        {
          label: 'Archive',
          icon: <Archive size={18} />,
          onClick: () => handleArchive('project-id'),
          color: 'warning'
        },
        {
          label: 'Delete',
          icon: <DeleteIcon size={18} />,
          onClick: () => handleDelete('project-id'),
          color: 'error'
        }
      ]}
    />
  )
}

export function ClientActionsExample() {
  const handleView = (id: string) => console.log('View client:', id)
  const handleEdit = (id: string) => console.log('Edit client:', id)
  const handleContact = (id: string) => console.log('Contact client:', id)
  const handleDelete = (id: string) => console.log('Delete client:', id)

  return (
    <ActionMenu
      items={[
        {
          label: 'View Details',
          icon: <Eye size={18} />,
          onClick: () => handleView('client-id'),
          color: 'primary'
        },
        {
          label: 'Edit Client',
          icon: <EditIcon size={18} />,
          onClick: () => handleEdit('client-id'),
          color: 'primary'
        },
        {
          label: 'Contact',
          icon: <MoreHorizontal size={18} />,
          onClick: () => handleContact('client-id'),
          color: 'info'
        },
        {
          label: 'Remove',
          icon: <DeleteIcon size={18} />,
          onClick: () => handleDelete('client-id'),
          color: 'error'
        }
      ]}
    />
  )
}

// Usage in DataGrid columns:
export const getActionColumn = (handleView: (id: string) => void, handleEdit: (id: string) => void, handleDelete: (id: string) => void) => ({
  field: 'actions',
  headerName: 'Actions',
  width: 80,
  sortable: false,
  filterable: false,
  renderCell: (params: any) => (
    <ActionMenu
      items={[
        {
          label: 'View',
          icon: <Eye size={18} />,
          onClick: () => handleView(params.row.id),
          color: 'primary'
        },
        {
          label: 'Edit',
          icon: <EditIcon size={18} />,
          onClick: () => handleEdit(params.row.id),
          color: 'primary'
        },
        {
          label: 'Delete',
          icon: <DeleteIcon size={18} />,
          onClick: () => handleDelete(params.row.id),
          color: 'error'
        }
      ]}
    />
  ),
})
