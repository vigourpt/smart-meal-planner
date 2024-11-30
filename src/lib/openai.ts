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
    // Remove any markdown code block markers and extra whitespace
    let cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/\r\n/g, '\n') // Normalize line endings
      .trim()

    // Handle potential trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')

    // Try to fix common JSON syntax errors
    cleaned = cleaned.replace(/,\s*$/m, '') // Remove trailing commas in lines
    cleaned = cleaned.replace(/([^"{}[\],\s])}/g, '$1"}') // Fix missing quotes before }
    cleaned = cleaned.replace(/([^"{}[\],\s])\]/g, '$1"]') // Fix missing quotes before ]

    // Verify it's valid JSON by parsing and stringifying
    const parsed = JSON.parse(cleaned)
    return JSON.stringify(parsed)
  } catch (error) {
    console.error('Error cleaning JSON response:', error)
    throw error
  }
}

function validateMealBudget(meal: any, weeklyBudget: number, mealsCount: number): boolean {
  const maxCostPerMeal = weeklyBudget / mealsCount
  return meal.totalCost <= maxCostPerMeal * 1.2 // Allow 20% buffer per meal
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
  const maxJsonRetries = 2 // Max retries for JSON parsing errors

  while (meals.length < count && retryCount < maxRetries) {
    for (let i = 0; i < batches && meals.length < count; i++) {
      const currentBatchSize = Math.min(batchSize, count - meals.length)
      const existingMealsList = Array.from(existingNames).join(', ')
      
      let jsonRetries = 0
      let validResponse = false
      let parsedContent

      while (!validResponse && jsonRetries < maxJsonRetries) {
        try {
          const completion = await openai.chat.completions.create({
            messages: [
              {
                role: "system",
                content: `You are a meal planning assistant. Generate ${currentBatchSize} UNIQUE ${category} recipes.
                The meal names must be different from these existing meals: ${existingMealsList}
                
                Budget constraints:
                - Weekly budget: ${weeklyBudget} ${currency}
                - Maximum cost per meal: ${maxCostPerMeal.toFixed(2)} ${currency}
                
                For each meal, include:
                - Name (must be unique and descriptive)
                - List of ingredients with estimated costs in ${currency}
                - Detailed recipe instructions
                - Preparation time
                - Health score (1-10)
                - Detailed macros (calories, protein, carbs, fat, fiber)
                
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
                        "fat": 20,
                        "fiber": 5
                      }
                    }
                  ]
                }
                
                Important:
                1. Each meal name must be unique and not in the existing meals list
                2. Names should be descriptive and specific
                3. Follow dietary preferences: ${preferences}
                4. Total cost must not exceed ${maxCostPerMeal.toFixed(2)} ${currency} per meal
                
                Return ONLY the JSON object, no markdown or code block markers.`
              },
              {
                role: "user",
                content: `Generate ${currentBatchSize} unique ${category} recipes with these preferences: ${preferences}`
              }
            ],
            model: "gpt-4-turbo-preview",
            temperature: 0.7,
            max_tokens: 2000,
            seed: Date.now() + i // Use different seed for each batch
          })

          const content = completion.choices[0].message.content
          if (!content) {
            console.log(`No content in response for batch ${i}, retrying...`)
            jsonRetries++
            continue
          }

          const cleanedContent = cleanJsonResponse(content)
          parsedContent = JSON.parse(cleanedContent)
          if (!parsedContent.meals || !Array.isArray(parsedContent.meals)) {
            console.log(`Invalid response format for batch ${i}, retrying...`)
            jsonRetries++
            continue
          }

          validResponse = true
        } catch (error) {
          console.error(`JSON parsing error, attempt ${jsonRetries + 1}:`, error)
          jsonRetries++
          if (jsonRetries >= maxJsonRetries) {
            throw new Error('Failed to parse JSON response after multiple attempts')
          }
        }
      }

      if (!parsedContent) continue

      // Filter out meals with duplicate names or exceeding budget
      const newMeals = parsedContent.meals.filter((meal: any) => {
        const isUnique = !existingNames.has(meal.name)
        const withinBudget = validateMealBudget(meal, weeklyBudget, totalMealsPerWeek)
        
        if (!isUnique) {
          console.log(`Duplicate meal name found: ${meal.name}, skipping...`)
        }
        if (!withinBudget) {
          console.log(`Meal exceeds budget: ${meal.name}, skipping...`)
        }
        
        if (isUnique && withinBudget) {
          existingNames.add(meal.name)
          return true
        }
        return false
      })

      meals.push(...newMeals)
      console.log(`Generated ${newMeals.length} unique meals in batch ${i}`)
    }

    if (meals.length < count) {
      console.log(`Only generated ${meals.length}/${count} meals, retrying...`)
      retryCount++
    }
  }

  if (meals.length < count) {
    throw new Error(`Failed to generate enough unique meals after ${maxRetries} retries`)
  }

  return meals.slice(0, count)
}

export async function generateFullMealPlan(preferences: string): Promise<{ meals: GeneratedMeal[] }> {
  try {
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
    throw error
  }
}

export async function generateMealsByCategory(category: string, count: number = 10): Promise<GeneratedMeal[]> {
  try {
    const existingNames = new Set<string>()
    const meals = await generateMealsInBatches('', category, count, existingNames)
    return meals.map(meal => ({
      ...meal,
      createdAt: new Date()
    }))
  } catch (error) {
    console.error('Error generating meals:', error)
    throw error
  }
}
