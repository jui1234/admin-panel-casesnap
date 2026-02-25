# ActionMenu Component

A reusable 3-dot menu component for displaying action buttons in a dropdown format.

## Features

- **3-dot menu**: Clean, space-efficient design
- **Customizable actions**: Add any number of menu items
- **Color coding**: Support for different action colors (primary, error, warning, etc.)
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper keyboard navigation and screen reader support

## Usage

### Basic Usage

```tsx
import ActionMenu from '@/components/ActionMenu'
import { Eye, Edit, Delete } from 'lucide-react'

<ActionMenu
  items={[
    {
      label: 'View',
      icon: <Eye size={18} />,
      onClick: () => handleView(id),
      color: 'primary'
    },
    {
      label: 'Edit',
      icon: <Edit size={18} />,
      onClick: () => handleEdit(id),
      color: 'primary'
    },
    {
      label: 'Delete',
      icon: <Delete size={18} />,
      onClick: () => handleDelete(id),
      color: 'error'
    }
  ]}
/>
```

### In DataGrid Columns

```tsx
const columns: GridColDef[] = [
  // ... other columns
  {
    field: 'actions',
    headerName: 'Actions',
    width: 80,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
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
            icon: <Edit size={18} />,
            onClick: () => handleEdit(params.row.id),
            color: 'primary'
          },
          {
            label: 'Delete',
            icon: <Delete size={18} />,
            onClick: () => handleDelete(params.row.id),
            color: 'error'
          }
        ]}
      />
    ),
  },
]
```

## Props

### ActionMenuProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ActionMenuItem[]` | - | Array of menu items to display |
| `size` | `'small' \| 'medium' \| 'large'` | `'small'` | Size of the 3-dot button |

### ActionMenuItem

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Text to display in the menu item |
| `icon` | `React.ReactNode` | Icon to display next to the label |
| `onClick` | `() => void` | Function to call when item is clicked |
| `color` | `'primary' \| 'secondary' \| 'error' \| 'warning' \| 'info' \| 'success'` | Optional color for the menu item |

## Color Options

- `primary` - Blue color (default for most actions)
- `secondary` - Gray color
- `error` - Red color (for delete/destructive actions)
- `warning` - Orange color
- `info` - Light blue color
- `success` - Green color

## Examples

### Employee Actions
```tsx
<ActionMenu
  items={[
    { label: 'View', icon: <Eye />, onClick: handleView, color: 'primary' },
    { label: 'Edit', icon: <Edit />, onClick: handleEdit, color: 'primary' },
    { label: 'Delete', icon: <Delete />, onClick: handleDelete, color: 'error' }
  ]}
/>
```

### Project Actions
```tsx
<ActionMenu
  items={[
    { label: 'View', icon: <Eye />, onClick: handleView, color: 'primary' },
    { label: 'Edit', icon: <Edit />, onClick: handleEdit, color: 'primary' },
    { label: 'Download', icon: <Download />, onClick: handleDownload, color: 'secondary' },
    { label: 'Share', icon: <Share />, onClick: handleShare, color: 'info' },
    { label: 'Archive', icon: <Archive />, onClick: handleArchive, color: 'warning' },
    { label: 'Delete', icon: <Delete />, onClick: handleDelete, color: 'error' }
  ]}
/>
```

## Styling

The component uses Material-UI's theming system and will automatically adapt to your app's theme. The menu has:

- Subtle shadow and border
- Hover effects
- Proper spacing and typography
- Responsive design

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- Proper ARIA labels
- Focus management
