import OpenAI from 'openai'
import { useStore } from './store'
import type { GeneratedMeal } from './firebase'

function getClient(): OpenAI {
  const apiKey = useStore.getState().settings.apiKey
  if (!apiKey) {
    throw new Error('OpenAI API key not found')
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  })
}

function logResponseContent(content: string, stage: string): void {
  console.log(`[${stage}] Content (first 500 chars):`, content.slice(0, 500))
  console.log(`[${stage}] Content length:`, content.length)
  try {
    const lines = content.split('\n')
    console.log(`[${stage}] First 5 lines:`, lines.slice(0, 5))
  } catch (error) {
    console.log(`[${stage}] Error splitting into lines:`, error)
  }
}

function validateJsonStructure(obj: any): boolean {
  try {
    if (!obj || typeof obj !== 'object') return false
    if (!obj.meals || !Array.isArray(obj.meals)) return false
    
    return obj.meals.every((meal: any) => {
      return (
        meal.name && typeof meal.name === 'string' &&
        meal.category && typeof meal.category === 'string' &&
        meal.ingredients && Array.isArray(meal.ingredients) &&
        meal.recipe && typeof meal.recipe === 'string' &&
        typeof meal.prepTime === 'number' &&
        typeof meal.healthScore === 'number' &&
        typeof meal.totalCost === 'number' &&
        meal.macros && typeof meal.macros === 'object' &&
        typeof meal.macros.calories === 'number' &&
        typeof meal.macros.protein === 'number' &&
        typeof meal.macros.carbs === 'number' &&
        typeof meal.macros.fat === 'number' &&
        typeof meal.macros.fiber === 'number'
      )
    })
  } catch (error) {
    console.error('Error validating JSON structure:', error)
    return false
  }
}

function cleanJsonResponse(content: string): string {
  try {
    logResponseContent(content, 'Initial content')

    // First, try to extract JSON if it's wrapped in other text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON object found in response')
      throw new Error('No JSON object found in response')
    }
    let cleaned = jsonMatch[0]
    logResponseContent(cleaned, 'After JSON extraction')

    // Remove any markdown code block markers and extra whitespace
    cleaned = cleaned
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/\r\n/g, '\n')
      .trim()
    logResponseContent(cleaned, 'After markdown cleanup')

    // Try to parse directly first
    try {
      const parsed = JSON.parse(cleaned)
      if (validateJsonStructure(parsed)) {
        return JSON.stringify(parsed)
      }
      console.log('Initial parse succeeded but invalid structure')
    } catch (initialError) {
      console.log('Initial parse failed:', initialError)
    }

    // If direct parsing fails, try to fix common issues
    cleaned = cleaned
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([^"{}[\],\s])}/g, '$1"}') // Fix missing quotes before }
      .replace(/([^"{}[\],\s])\]/g, '$1"]') // Fix missing quotes before ]
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Quote property names
      .replace(/:\s*'([^']*?)'/g, ':"$1"') // Convert single quotes to double
      .replace(/\n\s*([}\]])/g, '$1') // Remove newlines before closing brackets
    logResponseContent(cleaned, 'After fixes')

    // Try to parse again
    try {
      const parsed = JSON.parse(cleaned)
      if (validateJsonStructure(parsed)) {
        return JSON.stringify(parsed)
      }
      console.log('Second parse succeeded but invalid structure')
    } catch (secondError) {
      console.log('Second parse failed:', secondError)
    }

    // Final attempt with more aggressive cleaning
    cleaned = cleaned
      .replace(/(\w+):/g, '"$1":') // Quote all unquoted keys
      .replace(/([^"\\])"/g, '$1\\"') // Escape unescaped quotes
      .replace(/\\/g, '\\\\') // Escape backslashes
      .replace(/\n/g, '\\n') // Escape newlines
    logResponseContent(cleaned, 'After aggressive cleaning')

    const parsed = JSON.parse(cleaned)
    if (!validateJsonStructure(parsed)) {
      throw new Error('Invalid JSON structure after parsing')
    }
    return JSON.stringify(parsed)
  } catch (error) {
    console.error('Error cleaning JSON response:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw error
  }
}

async function generateMealsInBatches(
  preferences: string, 
  category: string, 
  count: number, 
  existingNames: Set<string>
): Promise<GeneratedMeal[]> {
  const openai = getClient()
  const state = useStore.getState()
  const currency = state.settings.currency
  const weeklyBudget = state.preferences.weeklyBudget
  const totalMealsPerWeek = 28 // 4 meals per day * 7 days
  const maxCostPerMeal = weeklyBudget / totalMealsPerWeek

  const batchSize = 5 // Generate 5 meals at a time
  const batches = Math.ceil(count / batchSize)
  const meals: GeneratedMeal[] = []
  let retryCount = 0
  const maxRetries = 3
  const maxJsonRetries = 3

  while (meals.length < count && retryCount < maxRetries) {
    for (let i = 0; i < batches && meals.length < count; i++) {
      const currentBatchSize = Math.min(batchSize, count - meals.length)
      const existingMealsList = Array.from(existingNames).join(', ')
      
      let jsonRetries = 0
      let validResponse = false
      let parsedContent

      while (!validResponse && jsonRetries < maxJsonRetries) {
        try {
          console.log(`Attempt ${jsonRetries + 1} for batch ${i}`)
          const completion = await openai.chat.completions.create({
            messages: [
              {
                role: "system",
                content: `You are a meal planning assistant that ONLY returns valid JSON. Generate ${currentBatchSize} unique ${category} recipes.
                The meal names must be different from: ${existingMealsList}
                
                Budget:
                - Weekly budget: ${weeklyBudget} ${currency}
                - Maximum per meal: ${maxCostPerMeal.toFixed(2)} ${currency}
                
                Return ONLY a JSON object with this EXACT structure:
                {
                  "meals": [
                    {
                      "name": "string",
                      "category": "${category}",
                      "ingredients": [
                        {
                          "name": "string",
                          "amount": "string",
                          "estimatedCost": number
                        }
                      ],
                      "recipe": "string",
                      "prepTime": number,
                      "healthScore": number,
                      "totalCost": number,
                      "macros": {
                        "calories": number,
                        "protein": number,
                        "carbs": number,
                        "fat": number,
                        "fiber": number
                      }
                    }
                  ]
                }
                
                Rules:
                1. Return ONLY the JSON object, nothing else
                2. Use double quotes for strings
                3. No trailing commas
                4. All property names must be quoted
                5. Numbers must be numeric values, not strings
                6. Follow preferences: ${preferences}
                7. Cost must not exceed ${maxCostPerMeal.toFixed(2)} ${currency} per meal`
              },
              {
                role: "user",
                content: `Generate ${currentBatchSize} unique ${category} recipes as JSON`
              }
            ],
            model: "gpt-4-turbo-preview",
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: "json_object" },
            seed: Date.now() + i
          })

          const content = completion.choices[0].message.content
          if (!content) {
            console.log(`No content in response for batch ${i}`)
            jsonRetries++
            continue
          }

          logResponseContent(content, `Response for batch ${i}`)
          const cleanedContent = cleanJsonResponse(content)
          parsedContent = JSON.parse(cleanedContent)
          
          if (!validateJsonStructure(parsedContent)) {
            console.log(`Invalid JSON structure for batch ${i}`)
            jsonRetries++
            continue
          }

          validResponse = true
        } catch (error) {
          console.error(`Error in batch ${i}, attempt ${jsonRetries + 1}:`, error)
          if (error instanceof Error) {
            console.error('Error details:', error.message)
            console.error('Error stack:', error.stack)
          }
          jsonRetries++
          if (jsonRetries >= maxJsonRetries) {
            throw new Error('Failed to generate valid meals after multiple attempts')
          }
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      if (!parsedContent) continue

      const newMeals = parsedContent.meals.filter((meal: any) => {
        const isUnique = !existingNames.has(meal.name)
        const withinBudget = meal.totalCost <= maxCostPerMeal * 1.2

        if (!isUnique) console.log(`Skipping duplicate meal: ${meal.name}`)
        if (!withinBudget) console.log(`Skipping over-budget meal: ${meal.name} (${meal.totalCost} > ${maxCostPerMeal * 1.2})`)
        
        if (isUnique && withinBudget) {
          existingNames.add(meal.name)
          return true
        }
        return false
      })

      meals.push(...newMeals)
      console.log(`Generated ${newMeals.length} valid meals in batch ${i}`)
    }

    if (meals.length < count) {
      console.log(`Only generated ${meals.length}/${count} meals, retrying...`)
      retryCount++
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  if (meals.length < count) {
    throw new Error(`Failed to generate enough unique meals after ${maxRetries} retries`)
  }

  return meals.slice(0, count)
}

export async function generateFullMealPlan(preferences: string): Promise<{ meals: GeneratedMeal[] }> {
  try {
    console.log('Generating meal plan with preferences:', preferences)
    const categories = ['breakfast', 'lunch', 'dinner', 'snack']
    const mealsPerCategory = 10
    const allMeals: GeneratedMeal[] = []
    const existingNames = new Set<string>()

    for (const category of categories) {
      console.log(`Generating ${mealsPerCategory} ${category} meals...`)
      const meals = await generateMealsInBatches(preferences, category, mealsPerCategory, existingNames)
      allMeals.push(...meals)
      console.log(`Successfully generated ${meals.length} ${category} meals`)
    }

    return {
      meals: allMeals.map(meal => ({
        ...meal,
        createdAt: new Date()
      }))
    }
  } catch (error) {
    console.error('Error generating meal plan:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw error
  }
}

export async function generateMealsByCategory(category: string, count: number = 10): Promise<GeneratedMeal[]> {
  try {
    console.log(`Generating ${count} ${category} meals...`)
    const existingNames = new Set<string>()
    const meals = await generateMealsInBatches('', category, count, existingNames)
    console.log(`Successfully generated ${meals.length} meals`)
    return meals.map(meal => ({
      ...meal,
      createdAt: new Date()
    }))
  } catch (error) {
    console.error('Error generating meals:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw error
  }
}
