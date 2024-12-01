import React from 'react'
import { useStore } from '../lib/store'
import { ChefHat, DollarSign, Clock, LineChart } from 'lucide-react'
import { formatCurrency } from '../lib/currency'

export const Dashboard = (): JSX.Element => {
  const { mealPlan, preferences, currency } = useStore(state => ({
    mealPlan: state.mealPlan,
    preferences: state.preferences,
    currency: state.settings.currency
  }))

  const totalMeals = mealPlan ? Object.keys(mealPlan.meals).length : 0
  const totalPlannedMeals = 28 // 7 days * 4 meals per day

  const totalCost = mealPlan ? Object.values(mealPlan.meals).reduce((total, meal) => {
    if (!meal?.recipe) return total
    return total + meal.recipe.totalCost
  }, 0) : 0

  const avgPrepTime = mealPlan ? Object.values(mealPlan.meals).reduce((total, meal) => {
    if (!meal?.recipe) return total
    return total + meal.recipe.prepTime
  }, 0) / (totalMeals || 1) : 0

  const healthScore = mealPlan ? Object.values(mealPlan.meals).reduce((total, meal) => {
    if (!meal?.recipe) return total
    return total + meal.recipe.healthScore
  }, 0) / (totalMeals || 1) : 0

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Weekly Meals</p>
              <h3 className="text-3xl font-bold mt-1">{totalMeals}/{totalPlannedMeals}</h3>
            </div>
            <ChefHat className="h-8 w-8 text-emerald-200" />
          </div>
          <p className="text-sm text-emerald-100 mt-2">Meals Planned</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Weekly Spending</p>
              <h3 className="text-3xl font-bold mt-1">{formatCurrency(totalCost, currency)}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-blue-200" />
          </div>
          <p className="text-sm text-blue-100 mt-2">Budget Management</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Prep Time</p>
              <h3 className="text-3xl font-bold mt-1">{Math.round(avgPrepTime)} min</h3>
            </div>
            <Clock className="h-8 w-8 text-purple-200" />
          </div>
          <p className="text-sm text-purple-100 mt-2">Avg. per Meal</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Health Score</p>
              <h3 className="text-3xl font-bold mt-1">{healthScore.toFixed(1)}/10</h3>
            </div>
            <LineChart className="h-8 w-8 text-orange-200" />
          </div>
          <p className="text-sm text-orange-100 mt-2">Based on Nutrition</p>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">How does meal generation work?</h3>
              <p className="mt-1 text-sm text-gray-600">Our AI analyzes your preferences, dietary restrictions, and nutritional goals to generate personalized meal plans that fit your needs.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Can I customize generated meals?</h3>
              <p className="mt-1 text-sm text-gray-600">Yes! You can adjust servings, swap ingredients, or replace entire meals from our recipe database.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">How is the health score calculated?</h3>
              <p className="mt-1 text-sm text-gray-600">The health score considers nutritional balance, caloric content, and alignment with dietary guidelines.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">How accurate are the cost estimates?</h3>
              <p className="mt-1 text-sm text-gray-600">Costs are estimated based on average prices in your region and are updated regularly for accuracy.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Can I save my favorite meals?</h3>
              <p className="mt-1 text-sm text-gray-600">Yes! Save any meal to your favorites for quick access when planning future weeks.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">How do I share my meal plan?</h3>
              <p className="mt-1 text-sm text-gray-600">Use the email button to share your complete meal plan, including recipes and shopping list.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
