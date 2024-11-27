import { create } from 'zustand'

interface UserPreferences {
  dietary: string[]
  allergies: string[]
  cuisineTypes: string[]
  servings: number
}

export interface Recipe {
  name: string
  ingredients: string[]
  recipe: string
  prepTime: number
  healthScore: number
}

interface MealPlanItem {
  recipe: Recipe | null
}

interface MealPlan {
  meals: Record<string, MealPlanItem>
}

interface ShoppingListItem {
  name: string
  quantity: number
  unit: string
  price: number
  purchased: boolean
}

interface Settings {
  darkMode: boolean
  apiKey: string | null
  currency: string
  toggleDarkMode: () => void
  setApiKey: (key: string) => void
  setCurrency: (currency: string) => void
}

interface State {
  settings: Settings
  mealPlan: MealPlan | null
  preferences: UserPreferences
  shoppingList: ShoppingListItem[]
  updateMealPlan: (mealPlan: MealPlan) => void
  updateMealInPlan: (day: string, mealType: string, recipe: Recipe | null) => void
  updateShoppingList: (items: ShoppingListItem[]) => void
  resetShoppingListSpending: () => void
  generateShoppingListFromMealPlan: (mealPlan: MealPlan) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
}

export const useStore = create<State>((set) => ({
  settings: {
    darkMode: false,
    apiKey: localStorage.getItem('openai_api_key'),
    currency: localStorage.getItem('currency') || 'USD',
    toggleDarkMode: () =>
      set((state) => ({
        settings: {
          ...state.settings,
          darkMode: !state.settings.darkMode
        }
      })),
    setApiKey: (key: string) => {
      localStorage.setItem('openai_api_key', key)
      set((state) => ({
        settings: {
          ...state.settings,
          apiKey: key
        }
      }))
    },
    setCurrency: (currency: string) => {
      localStorage.setItem('currency', currency)
      set((state) => ({
        settings: {
          ...state.settings,
          currency
        }
      }))
    }
  },
  mealPlan: null,
  preferences: {
    dietary: [],
    allergies: [],
    cuisineTypes: [],
    servings: 4
  },
  shoppingList: [],
  updateMealPlan: (mealPlan: MealPlan) =>
    set(() => ({
      mealPlan
    })),
  updateMealInPlan: (day: string, mealType: string, recipe: Recipe | null) =>
    set((state) => {
      const currentMealPlan = state.mealPlan || { meals: {} }
      
      return {
        mealPlan: {
          meals: {
            ...currentMealPlan.meals,
            [`${day}-${mealType}`]: { recipe }
          }
        }
      }
    }),
  updateShoppingList: (items: ShoppingListItem[]) =>
    set(() => ({
      shoppingList: items
    })),
  resetShoppingListSpending: () =>
    set((state) => ({
      shoppingList: state.shoppingList.map(item => ({
        ...item,
        purchased: false
      }))
    })),
  generateShoppingListFromMealPlan: (mealPlan: MealPlan) => {
    const allIngredients = Object.values(mealPlan.meals)
      .filter(meal => meal.recipe)
      .flatMap(meal => meal.recipe!.ingredients)
    
    const uniqueIngredients = [...new Set(allIngredients)]
    const shoppingList: ShoppingListItem[] = uniqueIngredients.map(ingredient => ({
      name: ingredient,
      quantity: 1,
      unit: 'unit',
      price: 0,
      purchased: false
    }))
    set({ shoppingList })
  },
  updatePreferences: (newPreferences: Partial<UserPreferences>) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        ...newPreferences
      }
    }))
}))
