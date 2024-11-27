import React from 'react'

interface Meal {
  name: string
  ingredients: string[]
  recipe: string
}

export interface MealCardProps {
  meal: Meal
}

export function MealCard({ meal }: MealCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">{meal.name}</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Ingredients:</h4>
        <ul className="list-disc list-inside">
          {meal.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2">Recipe:</h4>
        <p className="whitespace-pre-line">{meal.recipe}</p>
      </div>
    </div>
  )
}
