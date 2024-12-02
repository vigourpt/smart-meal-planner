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

  return (
    <div>
      <div className="flex justify-end space-x-4 mb-6">
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

      {/* Rest of MealPlanner component */}
    </div>
  )
}

export default MealPlanner
