import OpenAI from 'openai';
import { Recipe, UserPreferences, MealPlan } from '../types';
import { useStore } from './store';

let openai: OpenAI | null = null;

export function initializeOpenAI(apiKey: string) {
  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
}

export async function generateFullMealPlan(preferences: UserPreferences): Promise<MealPlan> {
  const apiKey = useStore.getState().apiKey;
  if (!apiKey) {
    throw new Error('OpenAI not initialized. Please set your API key in settings.');
  }

  // If using a test key, return sample data
  if (apiKey.startsWith('sk-test')) {
    console.log('Using test API key - returning sample data');
    return generateSampleMealPlan(preferences);
  }

  // Re-initialize OpenAI with current API key
  initializeOpenAI(apiKey);

  if (!openai) {
    throw new Error('Failed to initialize OpenAI client.');
  }

  const prompt = `Generate a weekly meal plan based on these preferences:
    - Dietary preferences: ${preferences.dietaryPreferences.join(', ')}
    - Allergies: ${preferences.allergies.join(', ')}
    - Weekly budget: ${preferences.weeklyBudget}
    - Health goals: ${preferences.healthGoals?.join(', ')}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
    });

    const suggestions = response.choices[0].message.content;
    if (!suggestions) {
      throw new Error('No suggestions received from OpenAI');
    }
    return convertAIResponseToMealPlan(suggestions, preferences);
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      throw new Error('Invalid API key. Please provide a valid OpenAI API key in settings.');
    }
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate meal plan. Please try again.');
  }
}

export async function generateRecipeSuggestions(preferences: UserPreferences): Promise<Recipe[]> {
  const apiKey = useStore.getState().apiKey;
  if (!apiKey) {
    throw new Error('OpenAI not initialized. Please set your API key in settings.');
  }

  // If using a test key, return sample data
  if (apiKey.startsWith('sk-test')) {
    console.log('Using test API key - returning sample data');
    return [generateSampleRecipe(), generateSampleRecipe(), generateSampleRecipe()];
  }

  // Re-initialize OpenAI with current API key
  initializeOpenAI(apiKey);

  if (!openai) {
    throw new Error('Failed to initialize OpenAI client.');
  }

  const prompt = `Suggest 5 recipes that match these preferences:
    - Dietary preferences: ${preferences.dietaryPreferences.join(', ')}
    - Allergies: ${preferences.allergies.join(', ')}
    - Health goals: ${preferences.healthGoals?.join(', ')}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
    });

    const suggestions = response.choices[0].message.content;
    if (!suggestions) {
      throw new Error('No suggestions received from OpenAI');
    }
    return convertAIResponseToRecipes(suggestions);
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      throw new Error('Invalid API key. Please provide a valid OpenAI API key in settings.');
    }
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate recipe suggestions. Please try again.');
  }
}

function generateSampleMealPlan(preferences: UserPreferences): MealPlan {
  return {
    id: crypto.randomUUID(),
    weekStartDate: new Date(),
    meals: {
      Monday: {
        breakfast: generateSampleRecipe('Oatmeal with Berries', ['Breakfast', 'Healthy']),
        lunch: generateSampleRecipe('Quinoa Salad', ['Lunch', 'Vegetarian']),
        dinner: generateSampleRecipe('Grilled Chicken', ['Dinner', 'High Protein'])
      },
      Tuesday: {
        breakfast: generateSampleRecipe('Greek Yogurt Parfait', ['Breakfast', 'High Protein']),
        lunch: generateSampleRecipe('Mediterranean Bowl', ['Lunch', 'Vegetarian']),
        dinner: generateSampleRecipe('Baked Salmon', ['Dinner', 'Seafood'])
      },
      Wednesday: {
        breakfast: generateSampleRecipe('Smoothie Bowl', ['Breakfast', 'Vegan']),
        lunch: generateSampleRecipe('Turkey Wrap', ['Lunch', 'High Protein']),
        dinner: generateSampleRecipe('Stir-Fry Tofu', ['Dinner', 'Vegetarian'])
      },
      Thursday: {
        breakfast: generateSampleRecipe('Avocado Toast', ['Breakfast', 'Vegetarian']),
        lunch: generateSampleRecipe('Chicken Caesar Salad', ['Lunch', 'High Protein']),
        dinner: generateSampleRecipe('Veggie Pasta', ['Dinner', 'Vegetarian'])
      },
      Friday: {
        breakfast: generateSampleRecipe('Protein Pancakes', ['Breakfast', 'High Protein']),
        lunch: generateSampleRecipe('Tuna Salad', ['Lunch', 'Seafood']),
        dinner: generateSampleRecipe('Black Bean Tacos', ['Dinner', 'Vegetarian'])
      },
      Saturday: {
        breakfast: generateSampleRecipe('Breakfast Burrito', ['Breakfast', 'High Protein']),
        lunch: generateSampleRecipe('Falafel Wrap', ['Lunch', 'Vegetarian']),
        dinner: generateSampleRecipe('Grilled Fish', ['Dinner', 'Seafood'])
      },
      Sunday: {
        breakfast: generateSampleRecipe('Chia Pudding', ['Breakfast', 'Vegan']),
        lunch: generateSampleRecipe('Buddha Bowl', ['Lunch', 'Vegetarian']),
        dinner: generateSampleRecipe('Lentil Curry', ['Dinner', 'Vegan'])
      }
    }
  };
}

function convertAIResponseToMealPlan(aiResponse: string, preferences: UserPreferences): MealPlan {
  // In a real app, we would parse the AI response here
  return generateSampleMealPlan(preferences);
}

function convertAIResponseToRecipes(aiResponse: string): Recipe[] {
  // In a real app, we would parse the AI response here
  return [generateSampleRecipe(), generateSampleRecipe(), generateSampleRecipe()];
}

function generateSampleRecipe(name: string = "Sample Recipe", tags: string[] = ["Healthy", "Quick"]): Recipe {
  return {
    id: crypto.randomUUID(),
    name,
    ingredients: [{
      id: "1",
      name: "Ingredient",
      amount: 1,
      unit: "cup",
      category: "Produce",
      estimatedCost: 2.99
    }],
    instructions: ["Step 1", "Step 2"],
    nutritionInfo: {
      calories: 400,
      protein: 20,
      carbs: 40,
      fat: 15,
      fiber: 5
    },
    prepTime: 30,
    servings: 4,
    tags,
    calories: 400
  };
}
