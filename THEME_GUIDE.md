# Theme System Guide

## Overview
The CaseSnap admin panel now includes a comprehensive dark/light theme system that provides a consistent user experience across all pages.

## Features

### 🌓 Dark/Light Mode Toggle
- **Theme Toggle Component**: Reusable `ThemeToggle` component available throughout the application
- **Persistent Theme**: User's theme preference is saved in localStorage
- **System Preference Detection**: Automatically detects user's system theme preference on first visit
- **Smooth Transitions**: All theme changes include smooth color transitions

### 🎨 Theme Implementation
- **Tailwind CSS**: Dark mode implemented using Tailwind's `dark:` prefix
- **Material-UI Integration**: Separate light and dark themes for Material-UI components
- **Context-based**: Theme state managed through React Context for global access

## Usage

### Using the Theme Toggle Component
```tsx
import ThemeToggle from '@/components/ThemeToggle'

// Basic usage
<ThemeToggle />

// With custom styling
<ThemeToggle className="fixed top-4 right-4" size="lg" />
```

### Accessing Theme in Components
```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <div className={`${isDark ? 'dark' : ''} bg-white dark:bg-gray-800`}>
      {/* Your content */}
    </div>
  )
}
```

## File Structure

```
admin-panel-casesnap/
├── contexts/
│   └── ThemeContext.tsx          # Theme context and provider
├── components/
│   ├── ThemeProvider.tsx         # Material-UI theme wrapper
│   └── ThemeToggle.tsx           # Reusable theme toggle button
├── app/
│   ├── theme.ts                  # Material-UI theme definitions
│   ├── page.tsx                  # Demo/landing page
│   └── auth/login/page.tsx       # Login page with theme support
└── tailwind.config.js            # Tailwind config with dark mode
```

## Theme Colors

### Light Theme
- Primary: Yellow (#facc15)
- Background: Light gray (#f8fafc)
- Text: Dark gray (#0f172a)
- Cards: White (#ffffff)

### Dark Theme
- Primary: Yellow (#facc15) - same as light
- Background: Dark slate (#0f172a)
- Text: Light gray (#f8fafc)
- Cards: Dark slate (#1e293b)

## Demo Page Features

The new demo page (`/`) includes:
- **Hero Section**: Compelling introduction to CaseSnap
- **Features Grid**: Showcase of key features with icons
- **Statistics**: Key metrics and achievements
- **Testimonials**: Customer reviews and ratings
- **Call-to-Action**: Multiple entry points to the application
- **Footer**: Comprehensive site navigation

## Navigation Flow

1. **Root Route (`/`)**: Demo/landing page with theme toggle
2. **Login Route (`/auth/login`)**: Login page with theme toggle
3. **Dashboard Route (`/dashboard`)**: Main application (existing)

## Browser Support

- **localStorage**: For theme persistence
- **CSS Custom Properties**: For dynamic theming
- **Modern CSS**: Tailwind's dark mode implementation
- **React Context**: For state management

## Future Enhancements

- [ ] Theme customization options
- [ ] Multiple color schemes
- [ ] Theme-based component variants
- [ ] Accessibility improvements (high contrast mode)
- [ ] Theme-aware charts and data visualizations
