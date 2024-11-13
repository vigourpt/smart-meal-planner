import React from 'react';
import { Plus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { RecipeSelector } from './RecipeSelector';
import type { Recipe } from '../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

export function MealPlanner() {
  const [currentWeek, setCurrentWeek] = React.useState(new Date());
  const [isRecipeSelectorOpen, setIsRecipeSelectorOpen] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState<{ day: string; mealType: string } | null>(null);
  const [meals, setMeals] = React.useState<Record<string, Record<string, Recipe>>>({});

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const handleMealSelect = (recipe: Recipe) => {
    if (selectedSlot) {
      setMeals(prev => ({
        ...prev,
        [selectedSlot.day]: {
          ...prev[selectedSlot.day],
          [selectedSlot.mealType]: recipe
        }
      }));
      setIsRecipeSelectorOpen(false);
      setSelectedSlot(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Meal Plan</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
            <span className="font-medium">
              Week of {currentWeek.toLocaleDateString()}
            </span>
          </div>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 bg-gray-50"></th>
              {DAYS.map(day => (
                <th key={day} className="px-4 py-2 bg-gray-50 font-medium text-gray-700">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEAL_TYPES.map(mealType => (
              <tr key={mealType}>
                <td className="px-4 py-2 font-medium text-gray-700 bg-gray-50">
                  {mealType}
                </td>
                {DAYS.map(day => (
                  <td key={`${day}-${mealType}`} className="border p-2">
                    <MealSlot
                      day={day}
                      mealType={mealType}
                      meal={meals[day]?.[mealType]}
                      onAddMeal={() => {
                        setSelectedSlot({ day, mealType });
                        setIsRecipeSelectorOpen(true);
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RecipeSelector
        isOpen={isRecipeSelectorOpen}
        onClose={() => {
          setIsRecipeSelectorOpen(false);
          setSelectedSlot(null);
        }}
        onSelect={handleMealSelect}
      />
    </div>
  );
}

interface MealSlotProps {
  day: string;
  mealType: string;
  meal?: Recipe;
  onAddMeal: () => void;
}

function MealSlot({ meal, onAddMeal }: MealSlotProps) {
  return (
    <div className="min-h-[100px] flex items-center justify-center">
      {meal ? (
        <div className="w-full p-2 bg-emerald-50 rounded-lg">
          <h4 className="font-medium text-emerald-800 text-sm">{meal.name}</h4>
          <div className="flex items-center text-xs text-emerald-600 mt-1">
            <span>{meal.prepTime} mins</span>
            <span className="mx-1">•</span>
            <span>{meal.calories} cal</span>
          </div>
        </div>
      ) : (
        <button
          onClick={onAddMeal}
          className="w-full h-full flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}