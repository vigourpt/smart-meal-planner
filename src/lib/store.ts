import { create } from 'zustand'
import type { GeneratedMeal, Ingredient } from './firebase'

interface UserPreferences {
  dietary: string[]
  allergies: string[]
  cuisineTypes: string[]
  servings: number
  weeklyBudget: number
}

interface MealPlanItem {
  recipe: GeneratedMeal | null
}

interface MealPlan {
  meals: Record<string, MealPlanItem>
}

interface ShoppingListItem {
  ingredient: Ingredient
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
  savedMeals: {
    [category: string]: GeneratedMeal[]
  }
  updateMealPlan: (mealPlan: MealPlan) => void
  updateMealInPlan: (day: string, mealType: string, recipe: GeneratedMeal | null) => void
  updateShoppingList: (items: ShoppingListItem[]) => void
  resetShoppingListSpending: () => void
  generateShoppingListFromMealPlan: (mealPlan: MealPlan) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  addSavedMeal: (meal: GeneratedMeal) => void
  updateWeeklyBudget: (amount: number) => void
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
    servings: 4,
    weeklyBudget: 150 // Default budget
  },
  shoppingList: [],
  savedMeals: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  },
  updateMealPlan: (mealPlan: MealPlan) =>
    set(() => ({
      mealPlan
    })),
  updateMealInPlan: (day: string, mealType: string, recipe: GeneratedMeal | null) =>
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
    
    // Create a map to combine same ingredients
    const ingredientMap = new Map<string, Ingredient>()
    
    allIngredients.forEach(ingredient => {
      const existing = ingredientMap.get(ingredient.name)
      if (existing) {
        // For now, just keep track of the total cost
        ingredientMap.set(ingredient.name, {
          ...ingredient,
          estimatedCost: existing.estimatedCost + ingredient.estimatedCost
        })
      } else {
        ingredientMap.set(ingredient.name, ingredient)
      }
    })

    const shoppingList: ShoppingListItem[] = Array.from(ingredientMap.values()).map(ingredient => ({
      ingredient,
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
    })),
  addSavedMeal: (meal: GeneratedMeal) =>
    set((state) => ({
      savedMeals: {
        ...state.savedMeals,
        [meal.category]: [...(state.savedMeals[meal.category] || []), meal]
      }
    })),
  updateWeeklyBudget: (amount: number) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        weeklyBudget: amount
      }
    }))
}))
