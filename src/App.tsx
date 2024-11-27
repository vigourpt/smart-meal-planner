import React from 'react'
import { Navigation } from './components/Navigation'
import { Dashboard } from './components/Dashboard'
import MealPlanner from './components/MealPlanner'
import { ShoppingList } from './components/ShoppingList'
import { Profile } from './components/Profile'
import { Settings } from './components/Settings'
import { useStore } from './lib/store'

type TabType = 'planner' | 'shopping' | 'profile' | 'settings'

const App = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>('planner')
  const darkMode = useStore(state => state.settings.darkMode)

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className={`text-4xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {activeTab === 'planner' ? 'Meal Planner' : 
           activeTab === 'shopping' ? 'Shopping List' :
           activeTab === 'profile' ? 'Profile' : 'Settings'}
        </h1>
        
        {activeTab === 'planner' && (
          <>
            <Dashboard />
            <section className="mt-12">
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
