import React, { useState } from 'react'
import { useStore } from '../lib/store'

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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={apiKey || ''}
              onChange={handleApiKeyChange}
              placeholder="sk-..."
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Servings
            </label>
            <input
              type="number"
              value={preferences.servings}
              onChange={handleServingsChange}
              min="1"
              className="w-24 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Restrictions
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newDietary}
                onChange={(e) => setNewDietary(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Add dietary restriction..."
              />
              <button
                onClick={handleAddDietary}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.dietary.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2"
                >
                  {item}
                  <button
                    onClick={() => handleRemoveDietary(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allergies
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Add allergy..."
              />
              <button
                onClick={handleAddAllergy}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.allergies.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2"
                >
                  {item}
                  <button
                    onClick={() => handleRemoveAllergy(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Cuisines
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCuisine}
                onChange={(e) => setNewCuisine(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Add cuisine type..."
              />
              <button
                onClick={handleAddCuisine}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.cuisineTypes.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2"
                >
                  {item}
                  <button
                    onClick={() => handleRemoveCuisine(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
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
