import React from 'react'
import { formatCurrency } from '../lib/currency'
import type { GeneratedMeal } from '../lib/firebase'

// Import types from store
interface MealPlanItem {
  recipe: GeneratedMeal | null
  servings?: number
}

interface MealPlan {
  meals: Record<string, MealPlanItem>
}

interface ShoppingListItem {
  ingredient: {
    name: string
    amount: string
    estimatedCost: number
  }
  purchased: boolean
}

interface PrintableViewProps {
  type: 'mealplan' | 'shoppinglist'
  data: MealPlan | ShoppingListItem[]
  currency: string
  weekRange?: string
}

export function PrintableView({ type, data, currency, weekRange }: PrintableViewProps) {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

  if (type === 'mealplan' && 'meals' in data) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Weekly Meal Plan</h1>
        {weekRange && <p className="text-center mb-8">{weekRange}</p>}
        
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="border p-2"></th>
                {DAYS.map(day => (
                  <th key={day} className="border p-2 font-medium">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEAL_TYPES.map(mealType => (
                <tr key={mealType}>
                  <td className="border p-2 font-medium">{mealType}</td>
                  {DAYS.map(day => {
                    const meal = data.meals[`${day}-${mealType}`]
                    return (
                      <td key={`${day}-${mealType}`} className="border p-2">
                        {meal?.recipe && (
                          <div>
                            <p className="font-medium">{meal.recipe.name}</p>
                            <p className="text-sm">{meal.recipe.macros.calories} kcal</p>
                            <p className="text-sm">Cost: {formatCurrency(meal.recipe.totalCost, currency)}</p>
                            <p className="text-sm">Servings: {meal.servings || 4}</p>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recipes</h2>
          {Object.values(data.meals).map((meal, index) => {
            if (!meal?.recipe) return null
            return (
              <div key={index} className="mb-6 pb-6 border-b">
                <h3 className="text-xl font-bold mb-2">{meal.recipe.name}</h3>
                <p className="mb-2">Servings: {meal.servings || 4}</p>
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Ingredients:</h4>
                  <ul className="list-disc pl-5">
                    {meal.recipe.ingredients.map((ingredient, idx) => (
                      <li key={idx}>{ingredient.amount} {ingredient.name}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Instructions:</h4>
                  <p className="whitespace-pre-wrap">{meal.recipe.recipe}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (type === 'shoppinglist' && Array.isArray(data)) {
    const total = data.reduce((sum, item) => sum + item.ingredient.estimatedCost, 0)

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Shopping List</h1>
        {weekRange && <p className="text-center mb-8">{weekRange}</p>}
        
        <div className="mb-4 text-right">
          <p className="font-medium">Total: {formatCurrency(total, currency)}</p>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="border p-2 text-left">Item</th>
                <th className="border p-2 text-left">Amount</th>
                <th className="border p-2 text-right">Estimated Cost</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className={item.purchased ? 'bg-gray-50' : ''}>
                  <td className="border p-2">{item.ingredient.name}</td>
                  <td className="border p-2">{item.ingredient.amount}</td>
                  <td className="border p-2 text-right">
                    {formatCurrency(item.ingredient.estimatedCost, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return null
}
