import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { 
  User as UserIcon, 
  DollarSign, 
  Clock, 
  Heart,
  Plus,
  X
} from 'lucide-react'

const AVAILABLE_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
]

export function Profile() {
  const { 
    preferences, 
    updatePreferences,
    currency,
    setCurrency
  } = useStore(state => ({
    preferences: state.preferences,
    updatePreferences: state.updatePreferences,
    currency: state.settings.currency,
    setCurrency: (currency: string) => state.settings.setCurrency(currency)
  }))

  const [newDietary, setNewDietary] = useState('')
  const [newAllergy, setNewAllergy] = useState('')
  const [newGoal, setNewGoal] = useState('')
  const [healthGoals, setHealthGoals] = useState<string[]>([
    'Maintain a balanced diet',
    'Increase protein intake'
  ])

  const handleAddDietary = () => {
    if (newDietary.trim()) {
      updatePreferences({
        dietary: [...preferences.dietary, newDietary.trim()]
      })
      setNewDietary('')
    }
  }

  const handleRemoveDietary = (index: number) => {
    updatePreferences({
      dietary: preferences.dietary.filter((_, i) => i !== index)
    })
  }

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      updatePreferences({
        allergies: [...preferences.allergies, newAllergy.trim()]
      })
      setNewAllergy('')
    }
  }

  const handleRemoveAllergy = (index: number) => {
    updatePreferences({
      allergies: preferences.allergies.filter((_, i) => i !== index)
    })
  }

  const handleAddGoal = () => {
    if (newGoal.trim() && !healthGoals.includes(newGoal.trim())) {
      setHealthGoals([...healthGoals, newGoal.trim()])
      setNewGoal('')
    }
  }

  const handleRemoveGoal = (index: number) => {
    setHealthGoals(healthGoals.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <UserIcon className="h-6 w-6 text-emerald-600" />
            <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
          </div>

          {/* Currency Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
            >
              {AVAILABLE_CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Dietary Restrictions */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Restrictions
            </label>
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                value={newDietary}
                onChange={(e) => setNewDietary(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border-gray-300"
                placeholder="Add dietary restriction..."
              />
              <button
                onClick={handleAddDietary}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {preferences.dietary.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                >
                  {item}
                  <button
                    onClick={() => handleRemoveDietary(index)}
                    className="ml-1.5 inline-flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allergies
            </label>
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border-gray-300"
                placeholder="Add allergy..."
              />
              <button
                onClick={handleAddAllergy}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {preferences.allergies.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  {item}
                  <button
                    onClick={() => handleRemoveAllergy(index)}
                    className="ml-1.5 inline-flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Health Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health Goals
            </label>
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border-gray-300"
                placeholder="Add health goal..."
              />
              <button
                onClick={handleAddGoal}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {healthGoals.map((goal, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {goal}
                  <button
                    onClick={() => handleRemoveGoal(index)}
                    className="ml-1.5 inline-flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
