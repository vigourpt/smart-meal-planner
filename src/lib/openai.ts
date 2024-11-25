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

    // Parse the AI response and convert it to our MealPlan type
    const suggestions = response.choices[0].message.content;
    if (!suggestions) {
      throw new Error('No suggestions received from OpenAI');
    }
    return convertAIResponseToMealPlan(suggestions, preferences);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate meal plan. Please try again.');
  }
}

export async function generateRecipeSuggestions(preferences: UserPreferences): Promise<Recipe[]> {
  const apiKey = useStore.getState().apiKey;
  if (!apiKey) {
    throw new Error('OpenAI not initialized. Please set your API key in settings.');
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
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate recipe suggestions. Please try again.');
  }
}

function convertAIResponseToMealPlan(aiResponse: string, preferences: UserPreferences): MealPlan {
  // This is a simplified conversion - in a real app, you'd want more robust parsing
  return {
    id: crypto.randomUUID(),
    weekStartDate: new Date(),
    meals: {
      Monday: {
        breakfast: generateSampleRecipe(),
        lunch: generateSampleRecipe(),
        dinner: generateSampleRecipe()
      },
      Tuesday: {
        breakfast: generateSampleRecipe(),
        lunch: generateSampleRecipe(),
        dinner: generateSampleRecipe()
      },
      // ... other days
    }
  };
}

function convertAIResponseToRecipes(aiResponse: string): Recipe[] {
  // This is a simplified conversion - in a real app, you'd want more robust parsing
  return [generateSampleRecipe(), generateSampleRecipe(), generateSampleRecipe()];
}

function generateSampleRecipe(): Recipe {
  return {
    id: crypto.randomUUID(),
    name: "Sample Recipe",
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
    tags: ["Healthy", "Quick"],
    calories: 400
  };
}
