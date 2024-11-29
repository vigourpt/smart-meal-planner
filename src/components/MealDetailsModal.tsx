import React from 'react'
import { X } from 'lucide-react'
import type { GeneratedMeal } from '../lib/firebase'
import { formatCurrency } from '../lib/currency'

interface MealDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  meal: GeneratedMeal
  servings: number
  currency: string
}

export function MealDetailsModal({ isOpen, onClose, meal, servings, currency }: MealDetailsModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-[50%] translate-y-[-50%] max-w-2xl mx-auto bg-white rounded-lg shadow-xl z-50 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{meal.name}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Calories</p>
              <p className="text-lg font-medium">{meal.macros.calories} kcal</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Cost</p>
              <p className="text-lg font-medium">{formatCurrency(meal.totalCost, currency)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Servings</p>
              <p className="text-lg font-medium">{servings}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Ingredients</h3>
              <ul className="list-disc pl-5 space-y-1">
                {meal.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-gray-600">
                    {ingredient.amount} {ingredient.name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Instructions</h3>
              <div className="text-gray-600 whitespace-pre-wrap">
                {meal.recipe}
              </div>
            </div>

            {meal.macros && (
              <div>
                <h3 className="text-lg font-medium mb-2">Nutrition Facts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Protein</p>
                    <p className="font-medium">{meal.macros.protein}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Carbohydrates</p>
                    <p className="font-medium">{meal.macros.carbs}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fat</p>
                    <p className="font-medium">{meal.macros.fat}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fiber</p>
                    <p className="font-medium">{meal.macros.fiber}g</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
