'use client'

import { useState } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box
} from '@mui/material'
import {
  MoreVert
} from '@mui/icons-material'

interface ActionMenuItem {
  label: string
  icon: React.ReactNode
  onClick: () => void
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
}

interface ActionMenuProps {
  items: ActionMenuItem[]
  size?: 'small' | 'medium' | 'large'
}

export default function ActionMenu({ items, size = 'small' }: ActionMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleItemClick = (onClick: () => void) => {
    onClick()
    handleClose()
  }

  return (
    <Box>
      <IconButton
        size={size}
        onClick={handleClick}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'action.hover',
            color: 'text.primary'
          }
        }}
      >
        <MoreVert />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: 160,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            mt: 0.5
          }
        }}
      >
        {items.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => handleItemClick(item.onClick)}
            sx={{
              py: 1,
              px: 2,
              '&:hover': {
                backgroundColor: item.color === 'error' ? 'error.light' : 'action.hover',
                color: item.color === 'error' ? 'error.contrastText' : 'inherit'
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 36,
                color: item.color === 'error' ? 'error.main' : 'text.secondary'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
