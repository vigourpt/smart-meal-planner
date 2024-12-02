import { create } from 'zustand'
import type { GeneratedMeal } from './firebase'

export interface UserPreferences {
  dietary: string[]
  allergies: string[]
  goals: string[]
  cuisineTypes: string[]
  servings: number
  [key: string]: any
}

export interface MealPlan {
  meals: {
    [key: number]: {
      recipe: GeneratedMeal
    }
  }
}

export interface Ingredient {
  name: string
  amount: string
  estimatedCost: number
}

export interface ShoppingListItem {
  name: string
  quantity: number
  unit: string
  cost: number
  checked: boolean
  ingredient: Ingredient
  purchased: boolean
}

export interface DietPlan {
  calories: number
  protein: number
  carbs: number
  fat: number
  type: string | null
  settings?: {
    [key: string]: any
  }
}

export interface Settings {
  currency: string
  apiKey: string
  weeklyBudget: number
}

interface State {
  mealPlan: MealPlan
  preferences: UserPreferences
  settings: Settings
  shoppingList: ShoppingListItem[]
  dietPlan: DietPlan
  setMealPlan: (mealPlan: MealPlan) => void
  setApiKey: (key: string) => void
  setCurrency: (currency: string) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  updateDietPlan: (plan: Partial<DietPlan>) => void
  updateWeeklyBudget: (budget: number) => void
  updateShoppingList: (items: ShoppingListItem[]) => void
  resetShoppingListSpending: () => void
}

// Initialize with default values
const initialMealPlan: MealPlan = {
  meals: {}
}

const initialPreferences: UserPreferences = {
  dietary: [],
  allergies: [],
  goals: [],
  cuisineTypes: [],
  servings: 4
}

const initialSettings: Settings = {
  currency: 'USD',
  apiKey: '',
  weeklyBudget: 0
}

const initialDietPlan: DietPlan = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  type: 'balanced'
}

export const useStore = create<State>((set) => ({
  mealPlan: initialMealPlan,
  preferences: initialPreferences,
  settings: initialSettings,
  shoppingList: [],
  dietPlan: initialDietPlan,
  setMealPlan: (mealPlan) => set({ mealPlan }),
  setApiKey: (apiKey) => set((state) => ({
    settings: { ...state.settings, apiKey }
  })),
  setCurrency: (currency) => set((state) => ({
    settings: { ...state.settings, currency }
  })),
  updatePreferences: (preferences) => set((state) => ({
    preferences: { ...state.preferences, ...preferences }
  })),
  updateDietPlan: (dietPlan) => set((state) => ({
    dietPlan: { ...state.dietPlan, ...dietPlan }
  })),
  updateWeeklyBudget: (weeklyBudget) => set((state) => ({
    settings: { ...state.settings, weeklyBudget }
  })),
  updateShoppingList: (shoppingList) => set({ shoppingList }),
  resetShoppingListSpending: () => set((state) => ({
    shoppingList: state.shoppingList.map(item => ({ ...item, purchased: false }))
  }))
}))
