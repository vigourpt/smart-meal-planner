import React, { useState } from 'react';
import { 
  Utensils, 
  DollarSign, 
  Clock, 
  TrendingUp,
  RotateCcw,
  Wand2,
  Loader2
} from 'lucide-react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/currency';
import { generateFullMealPlan } from '../lib/openai';
import confetti from 'canvas-confetti';

export function Dashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { 
    mealPlan, 
    updateMealPlan,
    shoppingList,
    currency,
    resetShoppingListSpending,
    addSavedMeal,
    generateShoppingListFromMealPlan,
    weeklyBudget
  } = useStore(state => ({
    mealPlan: state.mealPlan,
    updateMealPlan: state.updateMealPlan,
    shoppingList: state.shoppingList,
    currency: state.settings.currency,
    resetShoppingListSpending: state.resetShoppingListSpending,
    addSavedMeal: state.addSavedMeal,
    generateShoppingListFromMealPlan: state.generateShoppingListFromMealPlan,
    weeklyBudget: state.preferences.weeklyBudget
  }));

  const currentSpending = shoppingList.reduce((total, item) => total + item.ingredient.estimatedCost, 0);
  const avgPrepTime = mealPlan 
    ? Object.values(mealPlan.meals)
        .filter(meal => meal.recipe)
        .reduce((sum, meal) => sum + meal.recipe!.prepTime, 0) / 
      Object.values(mealPlan.meals).filter(meal => meal.recipe).length || 0
    : 0;
  const healthScore = mealPlan
    ? Object.values(mealPlan.meals)
        .filter(meal => meal.recipe)
        .reduce((sum, meal) => sum + meal.recipe!.healthScore, 0) /
      Object.values(mealPlan.meals).filter(meal => meal.recipe).length || 0
    : 0;
  const totalMealsPlanned = mealPlan ? Object.values(mealPlan.meals).filter(meal => meal.recipe).length : 0;
  const totalPossibleMeals = 28; // 4 meals a day (including snacks) for 7 days

  const handleAutoGenerate = async () => {
    try {
      setIsGenerating(true);
      const result = await generateFullMealPlan("");
      
      // Save each meal to the database
      result.meals.forEach(meal => {
        addSavedMeal(meal);
      });

      // Convert to meal plan format
      const newMealPlan = {
        meals: result.meals.reduce((acc, meal, index) => {
          const day = Math.floor(index / 4); // 4 meals per day including snacks
          const mealType = index % 4;
          const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day];
          const mealTypeName = ['Breakfast', 'Lunch', 'Dinner', 'Snack'][mealType];
          acc[`${dayName}-${mealTypeName}`] = { recipe: meal };
          return acc;
        }, {} as Record<string, { recipe: any }>)
      };

      updateMealPlan(newMealPlan);
      generateShoppingListFromMealPlan(newMealPlan);

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error('Error generating meal plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Meal Planner</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <Utensils className="h-6 w-6" />
            <h3 className="text-lg font-medium">Weekly Meals</h3>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{totalMealsPlanned}/{totalPossibleMeals}</p>
            <p className="text-sm opacity-90">Meals Planned</p>
          </div>
        </div>

        <div className="bg-blue-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <DollarSign className="h-6 w-6" />
            <h3 className="text-lg font-medium">Budget</h3>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">
              {formatCurrency(currentSpending, currency)}/{formatCurrency(weeklyBudget, currency)}
            </p>
            <p className="text-sm opacity-90">Weekly Spending</p>
          </div>
        </div>

        <div className="bg-purple-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <Clock className="h-6 w-6" />
            <h3 className="text-lg font-medium">Prep Time</h3>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{Math.round(avgPrepTime || 0)} min</p>
            <p className="text-sm opacity-90">Avg. per Meal</p>
          </div>
        </div>

        <div className="bg-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-6 w-6" />
            <h3 className="text-lg font-medium">Health Score</h3>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{healthScore.toFixed(1)}/10</p>
            <p className="text-sm opacity-90">Based on Nutrition</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={resetShoppingListSpending}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Spending
        </button>
        <button
          onClick={handleAutoGenerate}
          disabled={isGenerating}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isGenerating ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          {isGenerating ? 'Generating...' : 'Auto Generate Plan'}
        </button>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-emerald-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-emerald-900 mb-4">Quick Start Guide</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-emerald-200 text-emerald-800 text-sm font-medium">1</span>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-emerald-900">Set Your Preferences</h4>
              <p className="mt-1 text-sm text-emerald-700">Visit your profile to set dietary preferences, allergies, and health goals.</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-emerald-200 text-emerald-800 text-sm font-medium">2</span>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-emerald-900">Configure Budget</h4>
              <p className="mt-1 text-sm text-emerald-700">Set your weekly budget and preferred currency in settings.</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-emerald-200 text-emerald-800 text-sm font-medium">3</span>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-emerald-900">Plan Your Meals</h4>
              <p className="mt-1 text-sm text-emerald-700">Use Auto Generate or manually select meals for your week.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
