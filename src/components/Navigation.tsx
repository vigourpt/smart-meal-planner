import React from 'react';
import { ShoppingCart, Calendar, User, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: 'planner' | 'shopping' | 'profile' | 'settings';
  onTabChange: (tab: 'planner' | 'shopping' | 'profile' | 'settings') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-emerald-600">Smart Meal Planner</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <NavButton
              icon={<Calendar className="h-5 w-5" />}
              label="Meal Plan"
              active={activeTab === 'planner'}
              onClick={() => onTabChange('planner')}
            />
            <NavButton
              icon={<ShoppingCart className="h-5 w-5" />}
              label="Shopping List"
              active={activeTab === 'shopping'}
              onClick={() => onTabChange('shopping')}
            />
            <NavButton 
              icon={<User className="h-5 w-5" />} 
              label="Profile" 
              active={activeTab === 'profile'}
              onClick={() => onTabChange('profile')}
            />
            <NavButton 
              icon={<Settings className="h-5 w-5" />} 
              label="Settings" 
              active={activeTab === 'settings'}
              onClick={() => onTabChange('settings')}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavButton({ icon, label, active = false, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
        active
          ? 'text-emerald-600 bg-emerald-50'
          : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );
}