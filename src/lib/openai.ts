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
          content: `You are a meal planning assistant. Generate 40 meals total: 10 each for breakfast, lunch, dinner, and snacks. 
          For each meal, include:
          - Name
          - List of ingredients with estimated costs in ${currency}
          - Detailed recipe instructions
          - Preparation time
          - Health score (1-10)
          - Detailed macros (calories, protein, carbs, fat)
          
          Format each meal as a JSON object with the following structure:
          {
            "name": "Meal Name",
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
          
          Return an array of 40 meal objects, ensuring variety and adherence to the provided preferences.
          Provide realistic cost estimates for ingredients based on typical supermarket prices in ${currency}.`
        },
        {
          role: "user",
          content: `Generate a meal plan based on these preferences: ${preferences}`
        }
      ],
      model: "GPT-4o mini",
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content in response')
    }

    try {
      const parsedContent = JSON.parse(content)
      return {
        meals: parsedContent.meals.map((meal: any) => ({
          ...meal,
          createdAt: new Date()
        }))
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
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
          content: `You are a meal planning assistant. Generate ${count} ${category} recipes.
          For each meal, include:
          - Name
          - List of ingredients with estimated costs in ${currency}
          - Detailed recipe instructions
          - Preparation time
          - Health score (1-10)
          - Detailed macros (calories, protein, carbs, fat)
          
          Format each meal as a JSON object with the following structure:
          {
            "name": "Meal Name",
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
          
          Return an array of ${count} meal objects.
          Provide realistic cost estimates for ingredients based on typical supermarket prices in ${currency}.`
        },
        {
          role: "user",
          content: `Generate ${count} ${category} recipes with detailed nutritional information and cost estimates.`
        }
      ],
      model: "GPT-4o mini",
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content in response')
    }

    try {
      const parsedContent = JSON.parse(content)
      return parsedContent.meals.map((meal: any) => ({
        ...meal,
        createdAt: new Date()
      }))
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
      throw new Error('Failed to parse meal data')
    }
  } catch (error) {
    console.error('Error generating meals:', error)
    throw error
  }
}
