import React from 'react';
import { MealCard } from './MealCard';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/currency';
import { generateFullMealPlan } from '../lib/openai';
import { sendNotification } from '../lib/notifications';

export function Dashboard() {
  const { mealPlan, preferences, updateMealPlan } = useStore(state => ({
    mealPlan: state.mealPlan,
    preferences: state.preferences,
    updateMealPlan: state.updateMealPlan
  }));

  const handleGenerateMealPlan = async () => {
    try {
      const preferencesString = `
        Dietary restrictions: ${preferences.dietary.join(', ')}
        Allergies: ${preferences.allergies.join(', ')}
        Cuisine types: ${preferences.cuisineTypes.join(', ')}
        Servings: ${preferences.servings}
      `;
      
      const newMealPlan = await generateFullMealPlan(preferencesString);
      updateMealPlan(newMealPlan);
      sendNotification('Meal Plan Generated', 'Your new meal plan is ready!');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      sendNotification('Error', 'Failed to generate meal plan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button
          onClick={handleGenerateMealPlan}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate Meal Plan
        </button>
      </div>

      {mealPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealPlan.meals.map((meal, index) => (
            <MealCard key={index} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}
