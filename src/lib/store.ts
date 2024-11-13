import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences, MealPlan, Recipe } from '../types';

interface Settings {
  currency: {
    code: string;
    symbol: string;
  };
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  pushNotifications: boolean;
  openaiApiKey: string;
}

interface StoreState {
  settings: Settings;
  preferences: UserPreferences;
  mealPlan: MealPlan | null;
  recipes: Recipe[];
  updateSettings: (settings: Partial<Settings>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateMealPlan: (mealPlan: MealPlan) => void;
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (recipeId: string) => void;
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
        openaiApiKey: ''
      },
      preferences: {
        dietaryPreferences: [],
        allergies: [],
        weeklyBudget: 150,
        healthGoals: []
      },
      mealPlan: null,
      recipes: [],
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
        }))
    }),
    {
      name: 'meal-planner-store'
    }
  )
);