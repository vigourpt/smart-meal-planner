import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { generateFullMealPlan } from '../lib/openai'
import { ApiKeyModal } from './ApiKeyModal'
import { RecipeSelector } from './RecipeSelector'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { GeneratedMeal } from '../lib/firebase'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

interface RecipeSelectorState {
  isOpen: boolean
  day: string
  mealType: string
}

export default function MealPlanner() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipeSelector, setRecipeSelector] = useState<RecipeSelectorState>({
    isOpen: false,
    day: '',
    mealType: ''
  })
  
  const {
    mealPlan,
    updateMealPlan,
    updateMealInPlan,
    preferences,
    generateShoppingListFromMealPlan,
    apiKey
  } = useStore(state => ({
    mealPlan: state.mealPlan,
    updateMealPlan: state.updateMealPlan,
    updateMealInPlan: state.updateMealInPlan,
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

      const result = await generateFullMealPlan(preferencesString)
      const newMealPlan = {
        meals: result.meals.reduce((acc, meal, index) => {
          const day = Math.floor(index / 4)
          const mealType = index % 4
          const dayName = DAYS[day]
          const mealTypeName = MEAL_TYPES[mealType]
          acc[`${dayName}-${mealTypeName}`] = { recipe: meal }
          return acc
        }, {} as Record<string, { recipe: GeneratedMeal }>)
      }
      updateMealPlan(newMealPlan)
      generateShoppingListFromMealPlan(newMealPlan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meal plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const getWeekDates = () => {
    const start = new Date(currentWeek)
    start.setDate(start.getDate() - start.getDay() + 1) // Start from Monday
    return DAYS.map((_, i) => {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      return date
    })
  }

  const formatWeekRange = () => {
    const dates = getWeekDates()
    const start = dates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    return `Week of ${start}`
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newDate)
  }

  const handleOpenRecipeSelector = (day: string, mealType: string) => {
    setRecipeSelector({ isOpen: true, day, mealType })
  }

  const handleCloseRecipeSelector = () => {
    setRecipeSelector({ isOpen: false, day: '', mealType: '' })
  }

  const handleSelectRecipe = (recipe: GeneratedMeal) => {
    // Update meal plan
    const currentMealPlan = mealPlan || { meals: {} }
    const newMealPlan = {
      meals: {
        ...currentMealPlan.meals,
        [`${recipeSelector.day}-${recipeSelector.mealType}`]: { recipe }
      }
    }
    updateMealPlan(newMealPlan)
    
    // Update shopping list
    generateShoppingListFromMealPlan(newMealPlan)
    
    handleCloseRecipeSelector()
  }

  if (!apiKey) {
    return <ApiKeyModal />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meal Plan</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium">{formatWeekRange()}</span>
          <button
            onClick={() => navigateWeek('next')}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-8 divide-x divide-gray-200">
          {/* Time slots column */}
          <div className="col-span-1">
            <div className="h-12"></div> {/* Empty header cell */}
            {MEAL_TYPES.map((mealType) => (
              <div key={mealType} className="h-32 p-2 font-medium text-sm text-gray-500">
                {mealType}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {DAYS.map((day) => (
            <div key={day} className="col-span-1">
              <div className="h-12 flex items-center justify-center border-b border-gray-200">
                <span className="text-sm font-medium">{day}</span>
              </div>
              {MEAL_TYPES.map((mealType) => {
                const meal = mealPlan?.meals[`${day}-${mealType}`]
                return (
                  <div key={`${day}-${mealType}`} className="h-32 p-2 border-b border-gray-200">
                    {meal?.recipe ? (
                      <div className="w-full h-full p-2 bg-emerald-50 rounded-lg">
                        <p className="text-sm font-medium text-emerald-900 truncate">
                          {meal.recipe.name}
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          {meal.recipe.macros.calories} kcal
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenRecipeSelector(day, mealType)}
                        className="w-full h-full flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                      >
                        <Plus className="h-5 w-5 text-gray-400" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {recipeSelector.isOpen && (
        <RecipeSelector
          isOpen={recipeSelector.isOpen}
          onClose={handleCloseRecipeSelector}
          onSelect={handleSelectRecipe}
          day={recipeSelector.day}
          mealType={recipeSelector.mealType}
        />
      )}
    </div>
  )
}
