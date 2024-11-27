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
      <div className="flex h-screen">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-800">Smart Meal Planner</h1>
          </div>
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-8 py-6">
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
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
