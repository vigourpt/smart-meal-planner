import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { Plus, X } from 'lucide-react'

const COMMON_DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Keto',
  'Low-carb',
  'Paleo',
  'Mediterranean',
  'Pescatarian',
  'Halal',
  'Kosher'
]

const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree nuts',
  'Milk',
  'Eggs',
  'Soy',
  'Wheat',
  'Fish',
  'Shellfish',
  'Sesame'
]

const COMMON_HEALTH_GOALS = [
  'Weight loss',
  'Muscle gain',
  'Heart health',
  'Blood sugar control',
  'Energy boost',
  'Immune support',
  'Anti-inflammatory',
  'Gut health'
]

export function Profile() {
  const { preferences, updatePreferences } = useStore(state => ({
    preferences: state.preferences,
    updatePreferences: state.updatePreferences
  }))

  const [newDietary, setNewDietary] = useState('')
  const [newAllergy, setNewAllergy] = useState('')
  const [newHealthGoal, setNewHealthGoal] = useState('')

  const handleAddDietary = (value: string) => {
    if (value && !preferences.dietary.includes(value)) {
      updatePreferences({
        dietary: [...preferences.dietary, value]
      })
    }
    setNewDietary('')
  }

  const handleAddAllergy = (value: string) => {
    if (value && !preferences.allergies.includes(value)) {
      updatePreferences({
        allergies: [...preferences.allergies, value]
      })
    }
    setNewAllergy('')
  }

  const handleAddHealthGoal = (value: string) => {
    if (value && !preferences.cuisineTypes.includes(value)) {
      updatePreferences({
        cuisineTypes: [...preferences.cuisineTypes, value]
      })
    }
    setNewHealthGoal('')
  }

  const handleRemoveDietary = (restriction: string) => {
    updatePreferences({
      dietary: preferences.dietary.filter(d => d !== restriction)
    })
  }

  const handleRemoveAllergy = (allergy: string) => {
    updatePreferences({
      allergies: preferences.allergies.filter(a => a !== allergy)
    })
  }

  const handleRemoveHealthGoal = (goal: string) => {
    updatePreferences({
      cuisineTypes: preferences.cuisineTypes.filter(c => c !== goal)
    })
  }

  const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      updatePreferences({ servings: value })
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold">Profile</h2>

      {/* Dietary Restrictions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dietary Restrictions</h3>
        <div className="flex flex-wrap gap-2">
          {preferences.dietary.map(restriction => (
            <span
              key={restriction}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
            >
              {restriction}
              <button
                onClick={() => handleRemoveDietary(restriction)}
                className="ml-2 inline-flex items-center"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            value=""
            onChange={(e) => handleAddDietary(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          >
            <option value="">Select or type below to add...</option>
            {COMMON_DIETARY_RESTRICTIONS.filter(d => !preferences.dietary.includes(d)).map(diet => (
              <option key={diet} value={diet}>{diet}</option>
            ))}
          </select>
          <div className="relative flex-1">
            <input
              type="text"
              value={newDietary}
              onChange={(e) => setNewDietary(e.target.value)}
              placeholder="Add custom restriction..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm pr-10"
            />
            <button
              onClick={() => handleAddDietary(newDietary)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Allergies */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Allergies</h3>
        <div className="flex flex-wrap gap-2">
          {preferences.allergies.map(allergy => (
            <span
              key={allergy}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
            >
              {allergy}
              <button
                onClick={() => handleRemoveAllergy(allergy)}
                className="ml-2 inline-flex items-center"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            value=""
            onChange={(e) => handleAddAllergy(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          >
            <option value="">Select or type below to add...</option>
            {COMMON_ALLERGIES.filter(a => !preferences.allergies.includes(a)).map(allergy => (
              <option key={allergy} value={allergy}>{allergy}</option>
            ))}
          </select>
          <div className="relative flex-1">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              placeholder="Add custom allergy..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm pr-10"
            />
            <button
              onClick={() => handleAddAllergy(newAllergy)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Health Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Health Goals</h3>
        <div className="flex flex-wrap gap-2">
          {preferences.cuisineTypes.map(goal => (
            <span
              key={goal}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {goal}
              <button
                onClick={() => handleRemoveHealthGoal(goal)}
                className="ml-2 inline-flex items-center"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            value=""
            onChange={(e) => handleAddHealthGoal(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          >
            <option value="">Select or type below to add...</option>
            {COMMON_HEALTH_GOALS.filter(g => !preferences.cuisineTypes.includes(g)).map(goal => (
              <option key={goal} value={goal}>{goal}</option>
            ))}
          </select>
          <div className="relative flex-1">
            <input
              type="text"
              value={newHealthGoal}
              onChange={(e) => setNewHealthGoal(e.target.value)}
              placeholder="Add custom goal..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm pr-10"
            />
            <button
              onClick={() => handleAddHealthGoal(newHealthGoal)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Servings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Default Servings</h3>
        <div className="max-w-xs">
          <input
            type="number"
            min="1"
            max="8"
            value={preferences.servings}
            onChange={handleServingsChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          />
          <p className="mt-2 text-sm text-gray-500">
            Number of servings for generated recipes
          </p>
        </div>
      </div>
    </div>
  )
}
