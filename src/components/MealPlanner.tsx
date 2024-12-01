import React, { useState, useRef } from 'react'
import { useStore } from '../lib/store'
import { generateFullMealPlan, generateMealsByCategory } from '../lib/openai'
import { ApiKeyModal } from './ApiKeyModal'
import { RecipeSelector } from './RecipeSelector'
import { MealDetailsModal } from './MealDetailsModal'
import { ChevronLeft, ChevronRight, Plus, Users, MoreVertical, RefreshCw, List, Printer, Mail, Eye } from 'lucide-react'
import type { GeneratedMeal } from '../lib/firebase'
import { formatCurrency } from '../lib/currency'
import { PrintableView } from './PrintableView'
import * as ReactDOMServer from 'react-dom/server'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const

type Day = typeof DAYS[number]
type MealType = typeof MEAL_TYPES[number]

interface RecipeSelectorState {
  isOpen: boolean
  day: Day
  mealType: MealType
}

interface ContextMenuState {
  isOpen: boolean
  day: Day
  mealType: MealType
  x: number
  y: number
}

interface MealDetailsState {
  isOpen: boolean
  meal: GeneratedMeal | null
  servings: number
}

interface MealPlanItem {
  recipe: GeneratedMeal | null
  servings?: number
}

interface MealPlan {
  meals: {
    [key: string]: MealPlanItem
  }
}

const MealPlanner = (): JSX.Element => {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingMeal, setGeneratingMeal] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recipeSelector, setRecipeSelector] = useState<RecipeSelectorState>({
    isOpen: false,
    day: 'Monday',
    mealType: 'Breakfast'
  })
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    day: 'Monday',
    mealType: 'Breakfast',
    x: 0,
    y: 0
  })
  const [mealDetails, setMealDetails] = useState<MealDetailsState>({
    isOpen: false,
    meal: null,
    servings: 4
  })
  
  const printFrameRef = useRef<HTMLIFrameElement>(null)

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
    mealPlan: state.mealPlan as MealPlan,
    updateMealPlan: state.updateMealPlan,
    updateMealInPlan: state.updateMealInPlan,
    updateMealServings: state.updateMealServings,
    preferences: state.preferences,
    generateShoppingListFromMealPlan: state.generateShoppingListFromMealPlan,
    apiKey: state.settings.apiKey,
    currency: state.settings.currency,
    savedMeals: state.savedMeals
  }))

  const handleGenerateMealPlan = async (): Promise<void> => {
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
      const newMealPlan: MealPlan = {
        meals: result.meals.reduce((acc: Record<string, MealPlanItem>, meal: GeneratedMeal, index: number) => {
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

      try {
        updateMealPlan(newMealPlan)
        generateShoppingListFromMealPlan(newMealPlan)
      } catch (budgetError) {
        setError(budgetError instanceof Error ? budgetError.message : 'Meal plan exceeds weekly budget')
        return
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meal plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerateMeal = async (day: Day, mealType: MealType): Promise<void> => {
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
        try {
          updateMealInPlan(day, mealType, meals[0], preferences.servings)
          if (mealPlan) {
            generateShoppingListFromMealPlan(mealPlan)
          }
        } catch (budgetError) {
          setError(budgetError instanceof Error ? budgetError.message : 'Meal exceeds weekly budget')
          return
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meal')
    } finally {
      setGeneratingMeal(null)
    }
  }

  const formatWeekRange = (): string => {
    const start = new Date(currentWeek)
    start.setDate(start.getDate() - start.getDay() + 1) // Start from Monday
    return `Week of ${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }

  const navigateWeek = (direction: 'prev' | 'next'): void => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newDate)
    updateMealPlan({ meals: {} })
  }

  const handleOpenRecipeSelector = (day: Day, mealType: MealType): void => {
    setRecipeSelector({ isOpen: true, day, mealType })
    setContextMenu({ isOpen: false, day: 'Monday', mealType: 'Breakfast', x: 0, y: 0 })
  }

  const handleCloseRecipeSelector = (): void => {
    setRecipeSelector({ isOpen: false, day: 'Monday', mealType: 'Breakfast' })
  }

  const handleSelectRecipe = (recipe: GeneratedMeal): void => {
    updateMealInPlan(recipeSelector.day, recipeSelector.mealType, recipe, preferences.servings)
    handleCloseRecipeSelector()
    if (mealPlan) {
      generateShoppingListFromMealPlan(mealPlan)
    }
  }

  const handleServingsChange = (day: Day, mealType: MealType, servings: number): void => {
    try {
      updateMealServings(day, mealType, servings)
      if (mealPlan) {
        generateShoppingListFromMealPlan(mealPlan)
      }
    } catch (budgetError) {
      setError(budgetError instanceof Error ? budgetError.message : 'Serving change would exceed weekly budget')
    }
  }

  const handleContextMenu = (e: React.MouseEvent, day: Day, mealType: MealType): void => {
    e.preventDefault()
    setContextMenu({
      isOpen: true,
      day,
      mealType,
      x: e.clientX,
      y: e.clientY
    })
  }

  const handleEmail = (): void => {
    if (!mealPlan) return

    const formatMeal = (meal: MealPlanItem): string => {
      if (!meal?.recipe) return ''
      return `${meal.recipe.name} (${meal.recipe.macros.calories} kcal, ${formatCurrency(meal.recipe.totalCost, currency)})\n` +
        `Servings: ${meal.servings || preferences.servings}\n` +
        `\nIngredients:\n${meal.recipe.ingredients.map((ing: { amount: string, name: string }) => `- ${ing.amount} ${ing.name}`).join('\n')}\n` +
        `\nInstructions:\n${meal.recipe.recipe}\n\n`
    }

    let emailSubject = `Weekly Meal Plan - ${formatWeekRange()}`
    let emailBody = `Weekly Meal Plan - ${formatWeekRange()}\n\n`

    DAYS.forEach((day: Day) => {
      emailBody += `${day}:\n`
      MEAL_TYPES.forEach((mealType: MealType) => {
        const meal = mealPlan.meals[`${day}-${mealType}`]
        if (meal?.recipe) {
          emailBody += `\n${mealType}:\n${formatMeal(meal)}`
        }
      })
      emailBody += '\n'
    })

    const totalCost = Object.values(mealPlan.meals).reduce((total, meal) => {
      if (!meal?.recipe) return total
      return total + meal.recipe.totalCost
    }, 0)

    emailBody += `\nTotal Weekly Cost: ${formatCurrency(totalCost, currency)}`

    const encodedSubject = encodeURIComponent(emailSubject)
    const encodedBody = encodeURIComponent(emailBody)

    window.location.href = `mailto:?subject=${encodedSubject}&body=${encodedBody}`
  }

  if (!apiKey) {
    return <ApiKeyModal />
  }

  const isEmpty = !mealPlan || Object.keys(mealPlan.meals).length === 0

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
          <div className="flex gap-2 ml-4">
            {!isEmpty && (
              <button
                onClick={handleEmail}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </button>
            )}
            {isEmpty && (
              <div className="flex flex-col items-end">
                <button
                  onClick={handleGenerateMealPlan}
                  disabled={isGenerating}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Plan'}
                </button>
                <p className="text-xs text-gray-500 mt-1">This may take a few minutes to complete</p>
              </div>
            )}
          </div>
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
            <div className="h-12"></div>
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
                        className="relative w-full h-full p-2 bg-emerald-50 rounded-lg flex flex-col cursor-pointer hover:bg-emerald-100 transition-colors"
                        onClick={() => {
                          setMealDetails({
                            isOpen: true,
                            meal: meal.recipe,
                            servings: meal.servings || preferences.servings
                          })
                        }}
                        onContextMenu={(e) => handleContextMenu(e, day, mealType)}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-emerald-900 truncate">
                            {meal.recipe.name}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleContextMenu(e, day, mealType)
                            }}
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
                              value={meal.servings || preferences.servings}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleServingsChange(day, mealType, parseInt(e.target.value))
                              }}
                              className="text-xs bg-transparent border-none p-0"
                              onClick={(e) => e.stopPropagation()}
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
              const meal = mealPlan?.meals[`${contextMenu.day}-${contextMenu.mealType}`]
              if (meal) {
                setMealDetails({
                  isOpen: true,
                  meal: meal.recipe,
                  servings: meal.servings || preferences.servings
                })
                setContextMenu({ isOpen: false, day: 'Monday', mealType: 'Breakfast', x: 0, y: 0 })
              }
            }}
            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Meal
          </button>
          <button
            onClick={() => {
              handleRegenerateMeal(contextMenu.day, contextMenu.mealType)
              setContextMenu({ isOpen: false, day: 'Monday', mealType: 'Breakfast', x: 0, y: 0 })
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

      {mealDetails.meal && (
        <MealDetailsModal
          isOpen={mealDetails.isOpen}
          onClose={() => setMealDetails({ isOpen: false, meal: null, servings: 4 })}
          meal={mealDetails.meal}
          servings={mealDetails.servings}
          currency={currency}
        />
      )}

      {/* Click outside handler for context menu */}
      {contextMenu.isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu({ isOpen: false, day: 'Monday', mealType: 'Breakfast', x: 0, y: 0 })}
        />
      )}

      {/* Hidden iframe for printing */}
      <iframe
        ref={printFrameRef}
        style={{ display: 'none' }}
        title="Print Frame"
      />
    </div>
  )
}

export default MealPlanner
