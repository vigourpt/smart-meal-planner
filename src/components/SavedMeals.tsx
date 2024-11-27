import React, { useEffect, useState } from 'react'
import { getAllMeals, getMealsByCategory, type GeneratedMeal } from '../lib/firebase'
import { Clock, TrendingUp, DollarSign } from 'lucide-react'
import { useStore } from '../lib/store'
import { formatCurrency } from '../lib/currency'

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export function SavedMeals() {
  const [meals, setMeals] = useState<GeneratedMeal[]>([])
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number] | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const currency = useStore(state => state.settings.currency)

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const data = selectedCategory === 'all'
          ? await getAllMeals()
          : await getMealsByCategory(selectedCategory)
        setMeals(data)
      } catch (error) {
        console.error('Error fetching meals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMeals()
  }, [selectedCategory])

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
          {meals.map((meal) => (
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
                    {formatCurrency(meal.totalCost, currency)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Macros:</h4>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">{meal.macros.calories}</div>
                        <div className="text-xs text-gray-500">kcal</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">{meal.macros.protein}g</div>
                        <div className="text-xs text-gray-500">protein</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">{meal.macros.carbs}g</div>
                        <div className="text-xs text-gray-500">carbs</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">{meal.macros.fat}g</div>
                        <div className="text-xs text-gray-500">fat</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Ingredients:</h4>
                    <ul className="space-y-1">
                      {meal.ingredients.map((ingredient, index) => (
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
          ))}
        </div>
      )}
    </div>
  )
}
