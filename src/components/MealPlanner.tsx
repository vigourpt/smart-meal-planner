import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { generateFullMealPlan } from '../lib/openai'
import { ApiKeyModal } from './ApiKeyModal'

export default function MealPlanner() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    mealPlan,
    updateMealPlan,
    preferences,
    generateShoppingListFromMealPlan,
    apiKey
  } = useStore(state => ({
    mealPlan: state.mealPlan,
    updateMealPlan: state.updateMealPlan,
    preferences: state.preferences,
    generateShoppingListFromMealPlan: state.generateShoppingListFromMealPlan,
    apiKey: state.settings.apiKey
  }))

  const handleGenerateMealPlan = async () => {
    if (!apiKey) {
      setError('Please set your OpenAI API key first')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const preferencesString = `
        Dietary restrictions: ${preferences.dietary.join(', ')}
        Allergies: ${preferences.allergies.join(', ')}
        Cuisine types: ${preferences.cuisineTypes.join(', ')}
        Servings: ${preferences.servings}
      `

      const newMealPlan = await generateFullMealPlan(preferencesString)
      updateMealPlan(newMealPlan)
      generateShoppingListFromMealPlan(newMealPlan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meal plan')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!apiKey) {
    return <ApiKeyModal />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meal Planner</h2>
        <button
          onClick={handleGenerateMealPlan}
          disabled={isGenerating}
          className={`px-4 py-2 rounded text-white ${
            isGenerating ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate Meal Plan'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {mealPlan && (
        <div className="space-y-6">
          {mealPlan.meals.map((meal, index) => (
            <div key={index} className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">{meal.name}</h3>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Ingredients:</h4>
                <ul className="list-disc list-inside">
                  {meal.ingredients.map((ingredient, i) => (
                    <li key={i}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recipe:</h4>
                <p className="whitespace-pre-line">{meal.recipe}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
