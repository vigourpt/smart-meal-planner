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

export interface UserPreferences {
  dietary: string[]
  allergies: string[]
  cuisineTypes: string[]
  servings: number
  weeklyBudget: number
  dietPlan: DietPlan
}

export interface MealPlanItem {
  recipe: GeneratedMeal | null
  servings?: number
}

export interface MealPlan {
  meals: Record<string, MealPlanItem>
}

export interface ShoppingListItem {
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

export interface State {
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
    amount: ingredient.amount.replace(/\d+(\.\d+)?/g, (match) => {
      const num = parseFloat(match)
      return adjustForServings(num, originalServings, newServings).toFixed(2)
    }),
    estimatedCost: adjustForServings(ingredient.estimatedCost, originalServings, newServings)
  }
}

function calculateMealPlanCost(mealPlan: MealPlan): number {
  return Object.values(mealPlan.meals).reduce((total: number, meal: MealPlanItem) => {
    if (!meal.recipe) return total
    return total + meal.recipe.totalCost
  }, 0)
}

export const useStore = create<State>((set, get) => ({
  settings: {
    darkMode: false,
    apiKey: localStorage.getItem('openai_api_key'),
    currency: localStorage.getItem('currency') || 'USD',
    toggleDarkMode: () =>
      set((state: State) => ({
        settings: {
          ...state.settings,
          darkMode: !state.settings.darkMode
        }
      })),
    setApiKey: (key: string) => {
      localStorage.setItem('openai_api_key', key)
      set((state: State) => ({
        settings: {
          ...state.settings,
          apiKey: key
        }
      }))
    },
    setCurrency: (currency: string) => {
      localStorage.setItem('currency', currency)
      set((state: State) => ({
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
  updateMealPlan: (mealPlan: MealPlan) => {
    const totalCost = calculateMealPlanCost(mealPlan)
    const state = get()
    if (totalCost > state.preferences.weeklyBudget) {
      throw new Error(`Meal plan cost (${totalCost}) exceeds weekly budget (${state.preferences.weeklyBudget})`)
    }
    set(() => ({ mealPlan }))
  },
  updateMealInPlan: (day: string, mealType: string, recipe: GeneratedMeal | null, servings?: number) =>
    set((state: State) => {
      const currentMealPlan = state.mealPlan || { meals: {} }
      const newMealPlan = {
        meals: {
          ...currentMealPlan.meals,
          [`${day}-${mealType}`]: { recipe, servings: servings || state.preferences.servings }
        }
      }
      
      if (recipe) {
        const totalCost = calculateMealPlanCost(newMealPlan)
        if (totalCost > state.preferences.weeklyBudget) {
          throw new Error(`Adding this meal would exceed weekly budget (${state.preferences.weeklyBudget})`)
        }
      }

      return { mealPlan: newMealPlan }
    }),
  updateMealServings: (day: string, mealType: string, servings: number) =>
    set((state: State) => {
      if (!state.mealPlan) return state

      const mealKey = `${day}-${mealType}`
      const meal = state.mealPlan.meals[mealKey]
      if (!meal?.recipe) return state

      const originalServings = meal.servings || state.preferences.servings
      const recipe = meal.recipe

      const adjustedRecipe = {
        ...recipe,
        ingredients: recipe.ingredients.map((ing: Ingredient) => 
          adjustIngredientForServings(ing, originalServings, servings)
        ),
        totalCost: adjustForServings(recipe.totalCost, originalServings, servings),
        macros: {
          calories: adjustForServings(recipe.macros.calories, originalServings, servings),
          protein: adjustForServings(recipe.macros.protein, originalServings, servings),
          carbs: adjustForServings(recipe.macros.carbs, originalServings, servings),
          fat: adjustForServings(recipe.macros.fat, originalServings, servings),
          fiber: adjustForServings(recipe.macros.fiber, originalServings, servings)
        }
      }

      const newMealPlan = {
        meals: {
          ...state.mealPlan.meals,
          [mealKey]: { recipe: adjustedRecipe, servings }
        }
      }

      const totalCost = calculateMealPlanCost(newMealPlan)
      if (totalCost > state.preferences.weeklyBudget) {
        throw new Error(`Adjusting servings would exceed weekly budget (${state.preferences.weeklyBudget})`)
      }

      return { mealPlan: newMealPlan }
    }),
  updateShoppingList: (items: ShoppingListItem[]) =>
    set(() => ({
      shoppingList: items
    })),
  resetShoppingListSpending: () =>
    set((state: State) => ({
      shoppingList: state.shoppingList.map((item: ShoppingListItem) => ({
        ...item,
        purchased: false
      })),
      mealPlan: null
    })),
  generateShoppingListFromMealPlan: (mealPlan: MealPlan) => {
    const allIngredients = Object.entries(mealPlan.meals)
      .filter(([_, meal]) => meal.recipe)
      .flatMap(([_, meal]) => {
        const servings = meal.servings || 4
        return meal.recipe!.ingredients.map((ingredient: Ingredient) => ({
          ingredient,
          originalServings: 4,
          adjustedServings: servings
        }))
      })
    
    const ingredientMap = new Map<string, ShoppingListItem>()
    
    allIngredients.forEach(({ ingredient, originalServings, adjustedServings }) => {
      const existing = ingredientMap.get(ingredient.name)
      if (existing) {
        const adjustedCost = adjustForServings(ingredient.estimatedCost, originalServings, adjustedServings)
        ingredientMap.set(ingredient.name, {
          ...existing,
          ingredient: {
            ...existing.ingredient,
            estimatedCost: existing.ingredient.estimatedCost + adjustedCost
          }
        })
      } else {
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
    set((state: State) => ({
      preferences: {
        ...state.preferences,
        ...newPreferences
      }
    })),
  addSavedMeal: (meal: GeneratedMeal) =>
    set((state: State) => ({
      savedMeals: {
        ...state.savedMeals,
        [meal.category]: [...(state.savedMeals[meal.category] || []), meal]
      }
    })),
  updateWeeklyBudget: (amount: number) =>
    set((state: State) => ({
      preferences: {
        ...state.preferences,
        weeklyBudget: amount
      }
    })),
  updateDietPlan: (plan: DietPlan) =>
    set((state: State) => ({
      preferences: {
        ...state.preferences,
        dietPlan: plan
      }
    }))
}))
