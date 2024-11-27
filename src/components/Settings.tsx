import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { Plus, X } from 'lucide-react'

export function Settings() {
  const { preferences, updatePreferences, currency, apiKey, setApiKey } = useStore(state => ({
    preferences: state.preferences,
    updatePreferences: state.updatePreferences,
    currency: state.settings.currency,
    apiKey: state.settings.apiKey,
    setApiKey: state.settings.setApiKey
  }))

  const [newDietary, setNewDietary] = useState('')
  const [newAllergy, setNewAllergy] = useState('')
  const [newCuisine, setNewCuisine] = useState('')

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

  const handleAddCuisine = () => {
    if (newCuisine.trim()) {
      updatePreferences({
        cuisineTypes: [...preferences.cuisineTypes, newCuisine.trim()]
      })
      setNewCuisine('')
    }
  }

  const handleRemoveCuisine = (index: number) => {
    updatePreferences({
      cuisineTypes: preferences.cuisineTypes.filter((_, i) => i !== index)
    })
  }

  const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      updatePreferences({ servings: value })
    }
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">API Settings</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Enter your OpenAI API key to enable meal plan generation.</p>
          </div>
          <div className="mt-5">
            <input
              type="password"
              value={apiKey || ''}
              onChange={handleApiKeyChange}
              placeholder="sk-..."
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Meal Preferences</h3>
          
          <div className="mt-6 grid grid-cols-1 gap-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Servings
              </label>
              <input
                type="number"
                value={preferences.servings}
                onChange={handleServingsChange}
                min="1"
                className="mt-1 block w-24 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dietary Restrictions
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={newDietary}
                  onChange={(e) => setNewDietary(e.target.value)}
                  className="flex-1 min-w-0 block w-full rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                  placeholder="Add dietary restriction..."
                />
                <button
                  onClick={handleAddDietary}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {preferences.dietary.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Allergies
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  className="flex-1 min-w-0 block w-full rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                  placeholder="Add allergy..."
                />
                <button
                  onClick={handleAddAllergy}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Cuisines
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={newCuisine}
                  onChange={(e) => setNewCuisine(e.target.value)}
                  className="flex-1 min-w-0 block w-full rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                  placeholder="Add cuisine type..."
                />
                <button
                  onClick={handleAddCuisine}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {preferences.cuisineTypes.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {item}
                    <button
                      onClick={() => handleRemoveCuisine(index)}
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
    </div>
  )
}
