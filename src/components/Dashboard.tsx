import React from 'react';
import { MealCard } from './MealCard';
import { useStore } from '../lib/store';
import { generateFullMealPlan } from '../lib/openai';
import { sendNotification } from '../lib/notifications';
import { PlusCircle, RefreshCw } from 'lucide-react';

export function Dashboard() {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { mealPlan, preferences, updateMealPlan } = useStore(state => ({
    mealPlan: state.mealPlan,
    preferences: state.preferences,
    updateMealPlan: state.updateMealPlan
  }));

  const handleGenerateMealPlan = async () => {
    setIsGenerating(true);
    try {
      const preferencesString = `
        Dietary restrictions: ${preferences.dietary.join(', ')}
        Allergies: ${preferences.allergies.join(', ')}
        Cuisine types: ${preferences.cuisineTypes.join(', ')}
        Servings: ${preferences.servings}
      `;
      
      const newMealPlan = await generateFullMealPlan(preferencesString);
      updateMealPlan(newMealPlan);
      sendNotification('Success', 'Your new meal plan is ready!');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      sendNotification('Error', 'Failed to generate meal plan');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Meal Plan</h2>
          <p className="text-gray-600 mt-1">
            {mealPlan ? `${mealPlan.meals.length} meals planned` : 'No meals planned yet'}
          </p>
        </div>
        <div className="flex gap-3">
          {mealPlan && (
            <button
              onClick={handleGenerateMealPlan}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isGenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
          )}
          <button
            onClick={handleGenerateMealPlan}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate New Plan'}
          </button>
        </div>
      </div>

      {mealPlan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealPlan.meals.map((meal, index) => (
            <MealCard key={index} meal={meal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No meals planned</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by generating a new meal plan.
          </p>
        </div>
      )}
    </div>
  );
}
