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
  language: string;
}

interface StoreState {
  settings: Settings;
  preferences: UserPreferences;
  mealPlan: MealPlan | null;
  recipes: Recipe[];
  apiKey: string;
  updateSettings: (settings: Partial<Settings>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateMealPlan: (mealPlan: MealPlan) => void;
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (recipeId: string) => void;
  setApiKey: (apiKey: string) => void;
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
        }))
    }),
    {
      name: 'meal-planner-store'
    }
  )
);
