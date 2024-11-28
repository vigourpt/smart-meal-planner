import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { generateFullMealPlan, generateMealsByCategory } from '../lib/openai'
import { ApiKeyModal } from './ApiKeyModal'
import { RecipeSelector } from './RecipeSelector'
import { ChevronLeft, ChevronRight, Plus, Users, MoreVertical, RefreshCw, List } from 'lucide-react'
import type { GeneratedMeal } from '../lib/firebase'
import { formatCurrency } from '../lib/currency'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

interface RecipeSelectorState {
  isOpen: boolean
  day: string
  mealType: string
}

interface ContextMenuState {
  isOpen: boolean
  day: string
  mealType: string
  x: number
  y: number
}

interface MealPlanItem {
  recipe: GeneratedMeal
  servings: number
}

interface MealPlanAccumulator {
  [key: string]: MealPlanItem
}

export default function MealPlanner() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingMeal, setGeneratingMeal] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recipeSelector, setRecipeSelector] = useState<RecipeSelectorState>({
    isOpen: false,
    day: '',
    mealType: ''
  })
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    day: '',
    mealType: '',
    x: 0,
    y: 0
  })
  
  const {
    mealPlan,
    updateMealPlan,
    updateMealInPlan,
    updateMealServings,
    preferences,
    generateShoppingListFromMealPlan,
    apiKey,
    currency,
    savedMeals
  } = useStore(state => ({
    mealPlan: state.mealPlan,
    updateMealPlan: state.updateMealPlan,
    updateMealInPlan: state.updateMealInPlan,
    updateMealServings: state.updateMealServings,
    preferences: state.preferences,
    generateShoppingListFromMealPlan: state.generateShoppingListFromMealPlan,
    apiKey: state.settings.apiKey,
    currency: state.settings.currency,
    savedMeals: state.savedMeals
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
        meals: result.meals.reduce((acc: MealPlanAccumulator, meal: GeneratedMeal, index: number) => {
          const day = Math.floor(index / 4)
          const mealType = index % 4
          const dayName = DAYS[day]
          const mealTypeName = MEAL_TYPES[mealType]
          acc[`${dayName}-${mealTypeName}`] = { 
            recipe: meal,
            servings: preferences.servings
          }
          return acc
        }, {})
      }
      updateMealPlan(newMealPlan)
      generateShoppingListFromMealPlan(newMealPlan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meal plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerateMeal = async (day: string, mealType: string) => {
    if (!apiKey) {
      setError('Please set your OpenAI API key first')
      return
    }

    setGeneratingMeal(`${day}-${mealType}`)
    setError(null)

    try {
      const preferencesString = `
        Dietary restrictions: ${preferences.dietary.join(', ')}
        Allergies: ${preferences.allergies.join(', ')}
        Cuisine types: ${preferences.cuisineTypes.join(', ')}
        Servings: ${preferences.servings}
      `

      const meals = await generateMealsByCategory(mealType.toLowerCase(), 1)
      if (meals.length > 0) {
        updateMealInPlan(day, mealType, meals[0], preferences.servings)
        if (mealPlan) {
          generateShoppingListFromMealPlan(mealPlan)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meal')
    } finally {
      setGeneratingMeal(null)
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
    setContextMenu({ isOpen: false, day: '', mealType: '', x: 0, y: 0 })
  }

  const handleCloseRecipeSelector = () => {
    setRecipeSelector({ isOpen: false, day: '', mealType: '' })
  }

  const handleSelectRecipe = (recipe: GeneratedMeal) => {
    updateMealInPlan(recipeSelector.day, recipeSelector.mealType, recipe, preferences.servings)
    handleCloseRecipeSelector()
    if (mealPlan) {
      generateShoppingListFromMealPlan(mealPlan)
    }
  }

  const handleServingsChange = (day: string, mealType: string, servings: number) => {
    updateMealServings(day, mealType, servings)
    if (mealPlan) {
      generateShoppingListFromMealPlan(mealPlan)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, day: string, mealType: string) => {
    e.preventDefault()
    setContextMenu({
      isOpen: true,
      day,
      mealType,
      x: e.clientX,
      y: e.clientY
    })
  }

  const handleSelectSavedMeal = (meal: GeneratedMeal) => {
    updateMealInPlan(contextMenu.day, contextMenu.mealType, meal, preferences.servings)
    setContextMenu({ isOpen: false, day: '', mealType: '', x: 0, y: 0 })
    if (mealPlan) {
      generateShoppingListFromMealPlan(mealPlan)
    }
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
                const isGeneratingThis = generatingMeal === `${day}-${mealType}`
                return (
                  <div key={`${day}-${mealType}`} className="h-32 p-2 border-b border-gray-200">
                    {meal?.recipe ? (
                      <div 
                        className="relative w-full h-full p-2 bg-emerald-50 rounded-lg flex flex-col"
                        onContextMenu={(e) => handleContextMenu(e, day, mealType)}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-emerald-900 truncate">
                            {meal.recipe.name}
                          </p>
                          <button
                            onClick={(e) => handleContextMenu(e, day, mealType)}
                            className="p-1 hover:bg-emerald-100 rounded"
                          >
                            <MoreVertical className="h-4 w-4 text-emerald-600" />
                          </button>
                        </div>
                        <div className="mt-1 text-xs text-emerald-600 space-y-1">
                          <p>{meal.recipe.macros.calories} kcal</p>
                          <p>{formatCurrency(meal.recipe.totalCost, currency)}</p>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <select
                              value={meal.servings}
                              onChange={(e) => handleServingsChange(day, mealType, parseInt(e.target.value))}
                              className="text-xs bg-transparent border-none p-0"
                            >
                              {[1,2,3,4,5,6,7,8].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenRecipeSelector(day, mealType)}
                        className="w-full h-full flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                      >
                        {isGeneratingThis ? (
                          <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
                        ) : (
                          <Plus className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b border-gray-200">
            Select Action
          </div>
          <button
            onClick={() => {
              handleRegenerateMeal(contextMenu.day, contextMenu.mealType)
              setContextMenu({ isOpen: false, day: '', mealType: '', x: 0, y: 0 })
            }}
            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Meal
          </button>
          <button
            onClick={() => handleOpenRecipeSelector(contextMenu.day, contextMenu.mealType)}
            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center"
          >
            <List className="h-4 w-4 mr-2" />
            Select from Saved
          </button>
        </div>
      )}

      {recipeSelector.isOpen && (
        <RecipeSelector
          isOpen={recipeSelector.isOpen}
          onClose={handleCloseRecipeSelector}
          onSelect={handleSelectRecipe}
          day={recipeSelector.day}
          mealType={recipeSelector.mealType}
        />
      )}

      {/* Click outside handler for context menu */}
      {contextMenu.isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu({ isOpen: false, day: '', mealType: '', x: 0, y: 0 })}
        />
      )}
    </div>
  )
}
