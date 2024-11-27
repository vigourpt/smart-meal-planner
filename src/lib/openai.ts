import OpenAI from 'openai'
import { useStore } from './store'

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

export async function generateFullMealPlan(preferences: string) {
  try {
    const openai = getClient()
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful meal planning assistant."
        },
        {
          role: "user",
          content: `Generate a meal plan based on these preferences: ${preferences}`
        }
      ],
      model: "gpt-3.5-turbo",
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error generating meal plan:', error)
    throw error
  }
}
