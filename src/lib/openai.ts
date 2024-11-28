import OpenAI from 'openai'
import { useStore } from './store'
import type { GeneratedMeal } from './firebase'

function getClient() {
  const apiKey = useStore.getState().settings.apiKey
  if (!apiKey) {
    throw new Error('OpenAI API key not found')
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  })
}

function cleanJsonResponse(content: string): string {
  try {
    // Remove any markdown code block markers
    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // Verify it's valid JSON by parsing and stringifying
    const parsed = JSON.parse(cleaned)
    return JSON.stringify(parsed)
  } catch (error) {
    console.error('Error cleaning JSON response:', error)
    throw new Error('Invalid JSON response from API')
  }
}

async function generateMealsInBatches(preferences: string, category: string, count: number): Promise<GeneratedMeal[]> {
  const openai = getClient()
  const currency = useStore.getState().settings.currency
  const batchSize = 5 // Generate 5 meals at a time
  const batches = Math.ceil(count / batchSize)
  const meals: GeneratedMeal[] = []

  for (let i = 0; i < batches; i++) {
    const currentBatchSize = Math.min(batchSize, count - i * batchSize)
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a meal planning assistant. Generate ${currentBatchSize} UNIQUE ${category} recipes.
          For each meal, include:
          - Name (must be unique)
          - List of ingredients with estimated costs in ${currency}
          - Detailed recipe instructions
          - Preparation time
          - Health score (1-10)
          - Detailed macros (calories, protein, carbs, fat)
          
          Return a JSON object with this exact structure:
          {
            "meals": [
              {
                "name": "Unique Meal Name",
                "category": "${category}",
                "ingredients": [
                  {
                    "name": "ingredient1",
                    "amount": "1 cup",
                    "estimatedCost": 2.50
                  }
                ],
                "recipe": "Step by step instructions",
                "prepTime": 30,
                "healthScore": 8,
                "totalCost": 6.25,
                "macros": {
                  "calories": 500,
                  "protein": 30,
                  "carbs": 50,
                  "fat": 20
                }
              }
            ]
          }
          
          Return ONLY the JSON object, no markdown or code block markers.`
        },
        {
          role: "user",
          content: `Generate ${currentBatchSize} ${category} recipes with these preferences: ${preferences}`
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      max_tokens: 2000,
      seed: Date.now() // Use timestamp as seed for variety
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content in response')
    }

    try {
      const cleanedContent = cleanJsonResponse(content)
      const parsedContent = JSON.parse(cleanedContent)
      if (!parsedContent.meals || !Array.isArray(parsedContent.meals)) {
        throw new Error('Invalid response format')
      }
      meals.push(...parsedContent.meals)
    } catch (error) {
      console.error('Error in batch generation:', error)
      throw error
    }
  }

  return meals
}

export async function generateFullMealPlan(preferences: string): Promise<{ meals: GeneratedMeal[] }> {
  try {
    const categories = ['breakfast', 'lunch', 'dinner', 'snack']
    const mealsPerCategory = 10
    const allMeals: GeneratedMeal[] = []

    for (const category of categories) {
      console.log(`Generating ${mealsPerCategory} ${category} meals...`)
      const meals = await generateMealsInBatches(preferences, category, mealsPerCategory)
      allMeals.push(...meals)
    }

    // Verify meal names are unique
    const mealNames = new Set(allMeals.map(m => m.name))
    if (mealNames.size !== allMeals.length) {
      throw new Error('Duplicate meal names detected')
    }

    return {
      meals: allMeals.map(meal => ({
        ...meal,
        createdAt: new Date()
      }))
    }
  } catch (error) {
    console.error('Error generating meal plan:', error)
    throw error
  }
}

export async function generateMealsByCategory(category: string, count: number = 10): Promise<GeneratedMeal[]> {
  try {
    const meals = await generateMealsInBatches('', category, count)
    return meals.map(meal => ({
      ...meal,
      createdAt: new Date()
    }))
  } catch (error) {
    console.error('Error generating meals:', error)
    throw error
  }
}
