import OpenAI from 'openai'
import { useStore } from './store'

interface Meal {
  name: string
  ingredients: string[]
  recipe: string
}

interface MealPlan {
  meals: Meal[]
}

// Initialize OpenAI client with API key from store
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

function parseMealPlan(content: string): MealPlan {
  try {
    // Try to parse as JSON first
    return JSON.parse(content)
  } catch (e) {
    // If not JSON, try to parse the text format
    const meals: Meal[] = []
    const sections = content.split(/(?=Meal \d+:)/g)
    
    sections.forEach(section => {
      if (!section.trim()) return

      const nameMatch = section.match(/Meal \d+: (.+?)(?:\n|$)/)
      const ingredientsMatch = section.match(/Ingredients:\n((?:- .+\n?)+)/)
      const recipeMatch = section.match(/Recipe:\n([\s\S]+?)(?=(?:\n\nMeal \d+:|$))/)

      if (nameMatch && ingredientsMatch && recipeMatch) {
        const name = nameMatch[1].trim()
        const ingredients = ingredientsMatch[1]
          .split('\n')
          .map(i => i.replace(/^- /, '').trim())
          .filter(i => i)
        const recipe = recipeMatch[1].trim()

        meals.push({
          name,
          ingredients,
          recipe
        })
      }
    })

    return { meals }
  }
}

export async function generateFullMealPlan(preferences: string): Promise<MealPlan> {
  try {
    const openai = getClient()
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a meal planning assistant. Generate a meal plan with detailed recipes and ingredients. 
          Format each meal as follows:
          
          Meal 1: [Meal Name]
          Ingredients:
          - [Ingredient 1]
          - [Ingredient 2]
          ...
          Recipe:
          [Detailed cooking instructions]
          
          Meal 2: [Next Meal Name]
          ...`
        },
        {
          role: "user",
          content: `Generate a meal plan based on these preferences: ${preferences}`
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 2000
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content in response')
    }

    return parseMealPlan(content)
  } catch (error) {
    console.error('Error generating meal plan:', error)
    throw error
  }
}
