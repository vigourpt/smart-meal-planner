import React from 'react'
import { 
  CalendarDays,
  ShoppingCart,
  User,
  Settings as SettingsIcon,
  BookOpen
} from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: 'planner' | 'shopping' | 'profile' | 'settings' | 'saved') => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navItems = [
    { id: 'planner', label: 'Meal Plan', icon: CalendarDays },
    { id: 'saved', label: 'Saved Meals', icon: BookOpen },
    { id: 'shopping', label: 'Shopping List', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ]

  return (
    <nav className="flex space-x-4">
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onTabChange(id as any)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
              isActive
                ? 'bg-emerald-100 text-emerald-600'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Icon className="h-5 w-5 mr-1.5" />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
