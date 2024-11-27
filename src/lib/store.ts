import { create } from 'zustand'

interface UserPreferences {
  dietary: string[]
  allergies: string[]
  cuisineTypes: string[]
  servings: number
}

interface MealPlan {
  meals: {
    name: string
    ingredients: string[]
    recipe: string
  }[]
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
}

interface State {
  settings: Settings
  mealPlan: MealPlan | null
  preferences: UserPreferences
  shoppingList: ShoppingListItem[]
  updateMealPlan: (mealPlan: MealPlan) => void
  updateShoppingList: (items: ShoppingListItem[]) => void
  resetShoppingListSpending: () => void
  generateShoppingListFromMealPlan: (mealPlan: MealPlan) => void
}

export const useStore = create<State>((set) => ({
  settings: {
    darkMode: false,
    apiKey: null,
    currency: 'USD',
    toggleDarkMode: () =>
      set((state) => ({
        settings: {
          ...state.settings,
          darkMode: !state.settings.darkMode
        }
      })),
    setApiKey: (key: string) =>
      set((state) => ({
        settings: {
          ...state.settings,
          apiKey: key
        }
      }))
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
    const ingredients = mealPlan.meals.flatMap(meal => meal.ingredients)
    const shoppingList: ShoppingListItem[] = ingredients.map(ingredient => ({
      name: ingredient,
      quantity: 1,
      unit: 'unit',
      price: 0,
      purchased: false
    }))
    set({ shoppingList })
  }
}))
