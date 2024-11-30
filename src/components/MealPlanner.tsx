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

  const formatWeekRange = (): string => {
    const start = new Date(currentWeek)
    start.setDate(start.getDate() - start.getDay() + 1) // Start from Monday
    return `Week of ${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
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
    </div>
  )
}

export default MealPlanner
