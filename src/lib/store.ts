import { create } from 'zustand'
import type { GeneratedMeal, Ingredient } from './firebase'

export interface DietPlan {
  type: 'bulletproof' | 'intermittent_fasting' | 'slimming_world' | null
  settings: {
    // Bulletproof settings
    bulletproofWindow?: {
      start: string // HH:mm format
      end: string
    }
    // Intermittent fasting settings
    fastingWindow?: {
      start: string // HH:mm format
      end: string
    }
    // Slimming World settings
    weeklySyms?: number
  }
}

interface UserPreferences {
  dietary: string[]
  allergies: string[]
  cuisineTypes: string[]
  servings: number
  weeklyBudget: number
  dietPlan: DietPlan
}

interface MealPlanItem {
  recipe: GeneratedMeal | null
  servings?: number
}

interface MealPlan {
  meals: Record<string, MealPlanItem>
}

interface ShoppingListItem {
  ingredient: Ingredient
  purchased: boolean
  originalServings: number
  adjustedServings: number
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
  updateMealInPlan: (day: string, mealType: string, recipe: GeneratedMeal | null, servings?: number) => void
  updateMealServings: (day: string, mealType: string, servings: number) => void
  updateShoppingList: (items: ShoppingListItem[]) => void
  resetShoppingListSpending: () => void
  generateShoppingListFromMealPlan: (mealPlan: MealPlan) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  addSavedMeal: (meal: GeneratedMeal) => void
  updateWeeklyBudget: (amount: number) => void
  updateDietPlan: (plan: DietPlan) => void
}

function adjustForServings(value: number, originalServings: number, newServings: number): number {
  return (value * newServings) / originalServings
}

function adjustIngredientForServings(ingredient: Ingredient, originalServings: number, newServings: number): Ingredient {
  return {
    ...ingredient,
    // Adjust numeric amounts if possible
    amount: ingredient.amount.replace(/\d+(\.\d+)?/g, (match) => {
      const num = parseFloat(match)
      return adjustForServings(num, originalServings, newServings).toFixed(2)
    }),
    estimatedCost: adjustForServings(ingredient.estimatedCost, originalServings, newServings)
  }
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
    weeklyBudget: 150,
    dietPlan: {
      type: null,
      settings: {}
    }
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
  updateMealInPlan: (day: string, mealType: string, recipe: GeneratedMeal | null, servings?: number) =>
    set((state) => {
      const currentMealPlan = state.mealPlan || { meals: {} }
      
      return {
        mealPlan: {
          meals: {
            ...currentMealPlan.meals,
            [`${day}-${mealType}`]: { recipe, servings: servings || state.preferences.servings }
          }
        }
      }
    }),
  updateMealServings: (day: string, mealType: string, servings: number) =>
    set((state) => {
      if (!state.mealPlan) return state

      const mealKey = `${day}-${mealType}`
      const meal = state.mealPlan.meals[mealKey]
      if (!meal?.recipe) return state

      const originalServings = meal.servings || state.preferences.servings
      const recipe = meal.recipe

      // Adjust macros and costs for new serving size
      const adjustedRecipe = {
        ...recipe,
        ingredients: recipe.ingredients.map(ing => 
          adjustIngredientForServings(ing, originalServings, servings)
        ),
        totalCost: adjustForServings(recipe.totalCost, originalServings, servings),
        macros: {
          calories: adjustForServings(recipe.macros.calories, originalServings, servings),
          protein: adjustForServings(recipe.macros.protein, originalServings, servings),
          carbs: adjustForServings(recipe.macros.carbs, originalServings, servings),
          fat: adjustForServings(recipe.macros.fat, originalServings, servings)
        }
      }

      return {
        mealPlan: {
          meals: {
            ...state.mealPlan.meals,
            [mealKey]: { recipe: adjustedRecipe, servings }
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
    const allIngredients = Object.entries(mealPlan.meals)
      .filter(([_, meal]) => meal.recipe)
      .flatMap(([_, meal]) => {
        const servings = meal.servings || 4 // Default to 4 servings if not specified
        return meal.recipe!.ingredients.map(ingredient => ({
          ingredient,
          originalServings: 4, // Original recipe servings
          adjustedServings: servings
        }))
      })
    
    // Create a map to combine same ingredients
    const ingredientMap = new Map<string, ShoppingListItem>()
    
    allIngredients.forEach(({ ingredient, originalServings, adjustedServings }) => {
      const existing = ingredientMap.get(ingredient.name)
      if (existing) {
        // Adjust and combine costs
        const adjustedCost = adjustForServings(ingredient.estimatedCost, originalServings, adjustedServings)
        ingredientMap.set(ingredient.name, {
          ...existing,
          ingredient: {
            ...existing.ingredient,
            estimatedCost: existing.ingredient.estimatedCost + adjustedCost
          }
        })
      } else {
        // Add new ingredient with adjusted cost
        const adjustedIngredient = adjustIngredientForServings(ingredient, originalServings, adjustedServings)
        ingredientMap.set(ingredient.name, {
          ingredient: adjustedIngredient,
          purchased: false,
          originalServings,
          adjustedServings
        })
      }
    })

    set({ shoppingList: Array.from(ingredientMap.values()) })
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
    })),
  updateDietPlan: (plan: DietPlan) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        dietPlan: plan
      }
    }))
}))
