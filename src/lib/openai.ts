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

export async function generateFullMealPlan(preferences: string): Promise<{ meals: GeneratedMeal[] }> {
  try {
    const openai = getClient()
    const currency = useStore.getState().settings.currency

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a meal planning assistant. Generate 40 UNIQUE meals total: 10 each for breakfast, lunch, dinner, and snacks. 
          Each category must have completely different meals - no duplicates within or across categories.
          
          For each meal, include:
          - Name (must be unique)
          - List of ingredients with estimated costs in ${currency}
          - Detailed recipe instructions
          - Preparation time
          - Health score (1-10)
          - Detailed macros (calories, protein, carbs, fat)
          
          Your response must be a valid JSON string with this exact structure:
          {
            "meals": [
              {
                "name": "Unique Meal Name",
                "category": "breakfast|lunch|dinner|snack",
                "ingredients": [
                  {
                    "name": "ingredient1",
                    "amount": "1 cup",
                    "estimatedCost": 2.50
                  },
                  {
                    "name": "ingredient2",
                    "amount": "200g",
                    "estimatedCost": 3.75
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
          
          Important requirements:
          1. Generate EXACTLY 40 meals (10 each category)
          2. Each meal name must be unique
          3. Ensure variety in ingredients and cooking methods
          4. Provide realistic cost estimates in ${currency}
          5. Include detailed macros for each meal
          6. Make meals appropriate for their category (breakfast foods for breakfast, etc.)
          
          Your entire response must be a valid JSON string that can be parsed with JSON.parse().`
        },
        {
          role: "user",
          content: `Generate a meal plan based on these preferences: ${preferences}`
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      max_tokens: 4000
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content in response')
    }

    try {
      const parsedContent = JSON.parse(content)
      if (!parsedContent.meals || !Array.isArray(parsedContent.meals)) {
        throw new Error('Invalid response format')
      }

      // Verify we have enough meals in each category
      const categories = ['breakfast', 'lunch', 'dinner', 'snack']
      categories.forEach(category => {
        const mealsInCategory = parsedContent.meals.filter((m: any) => m.category === category)
        if (mealsInCategory.length < 10) {
          throw new Error(`Not enough ${category} meals generated. Expected 10, got ${mealsInCategory.length}`)
        }
      })

      // Verify meal names are unique
      const mealNames = new Set(parsedContent.meals.map((m: any) => m.name))
      if (mealNames.size !== parsedContent.meals.length) {
        throw new Error('Duplicate meal names detected')
      }

      return {
        meals: parsedContent.meals.map((meal: any) => ({
          ...meal,
          createdAt: new Date()
        }))
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
      console.error('Raw response:', content)
      throw new Error('Failed to parse meal plan data')
    }
  } catch (error) {
    console.error('Error generating meal plan:', error)
    throw error
  }
}

export async function generateMealsByCategory(category: string, count: number = 10): Promise<GeneratedMeal[]> {
  try {
    const openai = getClient()
    const currency = useStore.getState().settings.currency
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a meal planning assistant. Generate ${count} UNIQUE ${category} recipes.
          For each meal, include:
          - Name (must be unique)
          - List of ingredients with estimated costs in ${currency}
          - Detailed recipe instructions
          - Preparation time
          - Health score (1-10)
          - Detailed macros (calories, protein, carbs, fat)
          
          Your response must be a valid JSON string with this exact structure:
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
                  },
                  {
                    "name": "ingredient2",
                    "amount": "200g",
                    "estimatedCost": 3.75
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
          
          Important requirements:
          1. Generate EXACTLY ${count} unique meals
          2. Each meal name must be unique
          3. Ensure variety in ingredients and cooking methods
          4. Provide realistic cost estimates in ${currency}
          5. Include detailed macros for each meal
          
          Your entire response must be a valid JSON string that can be parsed with JSON.parse().`
        },
        {
          role: "user",
          content: `Generate ${count} ${category} recipes with detailed nutritional information and cost estimates.`
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      max_tokens: 2000
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content in response')
    }

    try {
      const parsedContent = JSON.parse(content)
      if (!parsedContent.meals || !Array.isArray(parsedContent.meals)) {
        throw new Error('Invalid response format')
      }

      // Verify meal names are unique
      const mealNames = new Set(parsedContent.meals.map((m: any) => m.name))
      if (mealNames.size !== parsedContent.meals.length) {
        throw new Error('Duplicate meal names detected')
      }

      return parsedContent.meals.map((meal: any) => ({
        ...meal,
        createdAt: new Date()
      }))
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
      console.error('Raw response:', content)
      throw new Error('Failed to parse meal data')
    }
  } catch (error) {
    console.error('Error generating meals:', error)
    throw error
  }
}
