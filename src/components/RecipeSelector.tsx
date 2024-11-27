import React, { useState, useEffect } from 'react'
import { X, Search, Plus } from 'lucide-react'
import { useStore } from '../lib/store'
import { getMealsByCategory, type GeneratedMeal } from '../lib/firebase'

interface RecipeSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (recipe: GeneratedMeal) => void
  day: string
  mealType: string
}

export function RecipeSelector({ isOpen, onClose, onSelect, day, mealType }: RecipeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [recipes, setRecipes] = useState<GeneratedMeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getMealsByCategory(mealType.toLowerCase())
        setRecipes(data)
      } catch (error) {
        console.error('Error fetching recipes:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchRecipes()
    }
  }, [isOpen, mealType])

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Select Recipe for {day} - {mealType}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              placeholder="Search recipes..."
            />
          </div>

          {/* Recipe List */}
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading recipes...</p>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">No recipes found.</p>
              </div>
            ) : (
              filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelect(recipe)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium">{recipe.name}</h4>
                      <p className="mt-1 text-xs text-gray-500">
                        {recipe.ingredients.join(', ')}
                      </p>
                    </div>
                    <button className="flex items-center text-emerald-600 hover:text-emerald-700">
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>{recipe.prepTime} min prep</span>
                    <span>•</span>
                    <span>{recipe.macros.calories} kcal</span>
                    <span>•</span>
                    <span>Health score: {recipe.healthScore}/10</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
