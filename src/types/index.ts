export interface UserPreferences {
  dietaryPreferences: string[];
  allergies: string[];
  weeklyBudget: number;
  healthGoals?: string[];
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutritionInfo: NutritionInfo;
  prepTime: number;
  servings: number;
  image?: string;
  tags: string[];
  calories?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  estimatedCost: number;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealPlan {
  id: string;
  weekStartDate: Date;
  meals: {
    [day: string]: {
      [mealType: string]: Recipe;
    };
  };
}

export interface ShoppingList {
  id: string;
  weekOf: Date;
  items: ShoppingItem[];
  totalBudget: number;
  estimatedTotal: number;
}

export interface ShoppingItem extends Ingredient {
  checked: boolean;
  recipes: string[];  // Recipe names that use this ingredient
}