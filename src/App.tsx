import React from 'react'
import { useState } from 'react'
import { Navigation } from './components/Navigation'
import { Dashboard } from './components/Dashboard'
import MealPlanner from './components/MealPlanner'
import { ShoppingList } from './components/ShoppingList'
import { Profile } from './components/Profile'
import { Settings } from './components/Settings'
import { useStore } from './lib/store'

type TabType = 'planner' | 'shopping' | 'profile' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('planner')
  const darkMode = useStore(state => state.settings.darkMode)

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-emerald-600">Smart Meal Planner</h1>
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'planner' && (
          <>
            <Dashboard />
            <section className="mt-8">
              <MealPlanner />
            </section>
          </>
        )}
        
        {activeTab === 'shopping' && <ShoppingList />}
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default App
