import React from 'react'
import { useStore, type MealPlan } from '../lib/store'
import { FileText, RefreshCw, Wand2 } from 'lucide-react'
import { generateFullMealPlan } from '../lib/openai'

export const MealPlanner = (): JSX.Element => {
  const { mealPlan, setMealPlan, preferences } = useStore(state => ({
    mealPlan: state.mealPlan,
    setMealPlan: state.setMealPlan,
    preferences: state.preferences
  }))

  const handlePrint = () => {
    // Open PrintableView in a new window
    const printWindow = window.open('/print-view', '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  const handleResetSpending = () => {
    // Reset weekly spending by clearing the meal plan but keeping saved meals
    setMealPlan({
      ...mealPlan,
      meals: {}
    })
  }

  const handleAutoGenerate = async () => {
    try {
      const preferencesString = JSON.stringify({
        dietary: preferences.dietary,
        allergies: preferences.allergies,
        goals: preferences.goals,
        cuisineTypes: preferences.cuisineTypes,
        servings: preferences.servings
      })

      const result = await generateFullMealPlan(preferencesString)
      if (result.meals) {
        setMealPlan({
          ...mealPlan,
          meals: result.meals.reduce((acc, meal, index) => {
            acc[index] = { recipe: meal }
            return acc
          }, {} as MealPlan['meals'])
        })
      }
    } catch (error) {
      console.error('Error generating meal plan:', error)
    }
  }

  // Helper function to get the day name
  const getDayName = (index: number): string => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days[Math.floor(index / 4)]
  }

  // Helper function to get the meal type
  const getMealType = (index: number): string => {
    const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
    return meals[index % 4]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-4">
        <button 
          onClick={handlePrint}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Print Meal Plan & Recipes
        </button>
        <button 
          onClick={handleResetSpending}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Spending
        </button>
        <button 
          onClick={handleAutoGenerate}
          className="px-4 py-2 text-white bg-emerald-600 rounded-md shadow-sm hover:bg-emerald-700 flex items-center gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Auto Generate Meal Plans
        </button>
      </div>

      {/* Meal Planner Calendar */}
      <div className="grid grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, dayIndex) => (
          <div key={dayIndex} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{getDayName(dayIndex * 4)}</h3>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, mealIndex) => {
                const index = dayIndex * 4 + mealIndex
                const meal = mealPlan.meals[index]

                return (
                  <div
                    key={mealIndex}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-500 cursor-pointer transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      {getMealType(mealIndex)}
                    </div>
                    {meal?.recipe ? (
                      <div>
                        <div className="font-medium text-gray-900">{meal.recipe.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {meal.recipe.prepTime} min • {meal.recipe.healthScore}/10
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">Click to add meal</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MealPlanner
