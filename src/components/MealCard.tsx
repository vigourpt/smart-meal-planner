import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Meal {
  name: string
  ingredients: string[]
  recipe: string
}

export interface MealCardProps {
  meal: Meal
}

export function MealCard({ meal }: MealCardProps) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{meal.name}</h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-150"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        <div className={`space-y-4 ${expanded ? '' : 'hidden'}`}>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Ingredients:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {meal.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Recipe:</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {meal.recipe}
            </p>
          </div>
        </div>

        {!expanded && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {meal.ingredients.length} ingredients
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
