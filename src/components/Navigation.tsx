import React from 'react'
import { 
  Home,
  ShoppingCart,
  User,
  Settings as SettingsIcon
} from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: 'planner' | 'shopping' | 'profile' | 'settings') => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navItems = [
    { id: 'planner', label: 'Meal Planner', icon: Home },
    { id: 'shopping', label: 'Shopping List', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ]

  return (
    <nav className="space-y-1">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id as any)}
          className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors duration-150 ${
            activeTab === id
              ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Icon className="h-5 w-5 mr-3" />
          {label}
        </button>
      ))}
    </nav>
  )
}
