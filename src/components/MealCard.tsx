import React from 'react';
import { Clock, Users } from 'lucide-react';
import type { Recipe } from '../types';

interface MealCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

export function MealCard({ recipe, onSelect }: MealCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect(recipe)}
    >
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{recipe.name}</h3>
        
        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{recipe.prepTime} mins</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-3 text-sm text-gray-500">
          <span className="font-medium">{recipe.nutritionInfo.calories}</span> calories per serving
        </div>
      </div>
    </div>
  );
}