import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences, MealPlan, Recipe, ShoppingList } from '../types';

interface Settings {
  currency: {
    code: string;
    symbol: string;
  };
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
}

interface StoreState {
  settings: Settings;
  preferences: UserPreferences;
  mealPlan: MealPlan | null;
  recipes: Recipe[];
  apiKey: string;
  shoppingList: ShoppingList | null;
  updateSettings: (settings: Partial<Settings>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateMealPlan: (mealPlan: MealPlan) => void;
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (recipeId: string) => void;
  setApiKey: (apiKey: string) => void;
  updateShoppingList: (list: ShoppingList) => void;
  resetShoppingListSpending: () => void;
  generateShoppingListFromMealPlan: (mealPlan: MealPlan) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      settings: {
        currency: {
          code: 'USD',
          symbol: '$'
        },
        theme: 'light',
        emailNotifications: false,
        pushNotifications: false,
        language: 'en-US'
      },
      preferences: {
        dietaryPreferences: [],
        allergies: [],
        weeklyBudget: 150,
        healthGoals: []
      },
      mealPlan: null,
      recipes: [],
      apiKey: '',
      shoppingList: null,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        })),
      updateMealPlan: (mealPlan) =>
        set(() => ({
          mealPlan
        })),
      addRecipe: (recipe) =>
        set((state) => ({
          recipes: [...state.recipes, recipe]
        })),
      removeRecipe: (recipeId) =>
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== recipeId)
        })),
      setApiKey: (apiKey) =>
        set(() => ({
          apiKey
        })),
      updateShoppingList: (list) =>
        set(() => ({
          shoppingList: list
        })),
      resetShoppingListSpending: () =>
        set((state) => ({
          shoppingList: state.shoppingList ? {
            ...state.shoppingList,
            estimatedTotal: 0,
            items: state.shoppingList.items.map(item => ({
              ...item,
              checked: false
            }))
          } : null
        })),
      generateShoppingListFromMealPlan: (mealPlan) =>
        set((state) => {
          // Extract all ingredients from the meal plan's recipes
          const allIngredients = Object.values(mealPlan.meals).flatMap(dayMeals =>
            Object.values(dayMeals).flatMap(recipe =>
              recipe.ingredients.map(ingredient => ({
                ...ingredient,
                recipes: [recipe.name]
              }))
            )
          );

          // Combine duplicate ingredients and merge their recipes
          const combinedIngredients = allIngredients.reduce((acc, curr) => {
            const existing = acc.find(item => 
              item.name === curr.name && 
              item.unit === curr.unit
            );

            if (existing) {
              existing.amount += curr.amount;
              existing.estimatedCost += curr.estimatedCost;
              existing.recipes = [...new Set([...existing.recipes, ...curr.recipes])];
              return acc;
            }

            return [...acc, { ...curr, checked: false }];
          }, [] as any[]);

          const totalCost = combinedIngredients.reduce(
            (sum, item) => sum + item.estimatedCost,
            0
          );

          return {
            shoppingList: {
              id: crypto.randomUUID(),
              weekOf: mealPlan.weekStartDate,
              items: combinedIngredients,
              totalBudget: state.preferences.weeklyBudget,
              estimatedTotal: totalCost
            }
          };
        })
    }),
    {
      name: 'meal-planner-store'
    }
  )
);
