import React, { useEffect, useState } from 'react'
import { getAllMeals, getMealsByCategory, type GeneratedMeal } from '../lib/firebase'
import { Clock, TrendingUp, DollarSign, Users } from 'lucide-react'
import { useStore } from '../lib/store'
import { formatCurrency } from '../lib/currency'

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export function SavedMeals() {
  const [meals, setMeals] = useState<GeneratedMeal[]>([])
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number] | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [servingSizes, setServingSizes] = useState<Record<string, number>>({})
  
  const currency = useStore(state => state.settings.currency)
  const defaultServings = useStore(state => state.preferences.servings)

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const data = selectedCategory === 'all'
          ? await getAllMeals()
          : await getMealsByCategory(selectedCategory)
        setMeals(data)
        // Initialize serving sizes
        const initialServings = data.reduce((acc, meal) => ({
          ...acc,
          [meal.id!]: defaultServings
        }), {})
        setServingSizes(initialServings)
      } catch (error) {
        console.error('Error fetching meals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMeals()
  }, [selectedCategory, defaultServings])

  const adjustForServings = (value: number, originalServings: number, newServings: number): number => {
    return (value * newServings) / originalServings
  }

  const handleServingsChange = (mealId: string, servings: number) => {
    setServingSizes(prev => ({
      ...prev,
      [mealId]: servings
    }))
  }

  const getAdjustedValues = (meal: GeneratedMeal) => {
    const servings = servingSizes[meal.id!] || defaultServings
    return {
      calories: adjustForServings(meal.macros.calories, defaultServings, servings),
      protein: adjustForServings(meal.macros.protein, defaultServings, servings),
      carbs: adjustForServings(meal.macros.carbs, defaultServings, servings),
      fat: adjustForServings(meal.macros.fat, defaultServings, servings),
      totalCost: adjustForServings(meal.totalCost, defaultServings, servings),
      ingredients: meal.ingredients.map(ing => ({
        ...ing,
        amount: ing.amount.replace(/\d+(\.\d+)?/g, (match) => {
          const num = parseFloat(match)
          return adjustForServings(num, defaultServings, servings).toFixed(2)
        }),
        estimatedCost: adjustForServings(ing.estimatedCost, defaultServings, servings)
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Saved Meals</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedCategory === 'all'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
                selectedCategory === category
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading meals...</p>
        </div>
      ) : meals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No meals found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => {
            const adjustedValues = getAdjustedValues(meal)
            return (
              <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{meal.name}</h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {meal.prepTime} min
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {meal.healthScore}/10
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(adjustedValues.totalCost, currency)}
                    </div>
                  </div>

                  <div className="flex items-center mb-4 space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <select
                      value={servingSizes[meal.id!] || defaultServings}
                      onChange={(e) => handleServingsChange(meal.id!, parseInt(e.target.value))}
                      className="text-sm border-gray-300 rounded-md"
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} servings</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Macros:</h4>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="font-medium">{Math.round(adjustedValues.calories)}</div>
                          <div className="text-xs text-gray-500">kcal</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="font-medium">{Math.round(adjustedValues.protein)}g</div>
                          <div className="text-xs text-gray-500">protein</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="font-medium">{Math.round(adjustedValues.carbs)}g</div>
                          <div className="text-xs text-gray-500">carbs</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="font-medium">{Math.round(adjustedValues.fat)}g</div>
                          <div className="text-xs text-gray-500">fat</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Ingredients:</h4>
                      <ul className="space-y-1">
                        {adjustedValues.ingredients.map((ingredient, index) => (
                          <li key={index} className="text-sm text-gray-600 flex justify-between">
                            <span>{ingredient.amount} {ingredient.name}</span>
                            <span className="text-gray-500">
                              {formatCurrency(ingredient.estimatedCost, currency)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Recipe:</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {meal.recipe}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
