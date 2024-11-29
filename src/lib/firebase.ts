import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, where, DocumentData } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyA4sjQtvOCsJjA8D4EM0VB1Aq40sO4xmXs",
  authDomain: "smart-meal-planner-4cee5.firebaseapp.com",
  projectId: "smart-meal-planner-4cee5",
  storageBucket: "smart-meal-planner-4cee5.firebasestorage.app",
  messagingSenderId: "21050594706",
  appId: "1:21050594706:web:91cd8d2195a663f56f5d4b",
  measurementId: "G-FJ3N8PGGTG"
}

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const db = getFirestore(app)

export interface Macros {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface Ingredient {
  name: string
  amount: string
  estimatedCost: number
}

export interface DietInfo {
  slimmingWorld?: {
    syns: number
    freeFood: boolean
    speedFood: boolean
  }
  bulletproof?: {
    approved: boolean
    mct: boolean
    grassFed: boolean
  }
  intermittentFasting?: {
    breaksFast: boolean
    calories: number
  }
}

export interface GeneratedMeal {
  id?: string
  name: string
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ingredients: Ingredient[]
  recipe: string
  prepTime: number
  healthScore: number
  totalCost: number
  macros: Macros
  createdAt: Date
  tags?: string[]
  dietInfo?: DietInfo
}

export async function saveMeal(meal: GeneratedMeal) {
  try {
    // Automatically add tags based on meal properties
    const autoTags: string[] = []
    
    // Quick & Easy
    if (meal.prepTime <= 20) {
      autoTags.push('Quick & Easy')
    }
    
    // High Protein
    if (meal.macros.protein >= 25) {
      autoTags.push('High Protein')
    }
    
    // Low Carb
    if (meal.macros.carbs <= 20) {
      autoTags.push('Low Carb')
    }
    
    // Budget Friendly
    if (meal.totalCost <= 10) {
      autoTags.push('Budget Friendly')
    }
    
    // Meal Prep
    if (meal.prepTime <= 45 && meal.ingredients.length <= 10) {
      autoTags.push('Meal Prep')
    }

    // Calculate diet-specific information
    const dietInfo: DietInfo = {}

    // Slimming World calculations
    const syns = calculateSlimmingWorldSyns(meal)
    if (syns !== undefined) {
      dietInfo.slimmingWorld = {
        syns,
        freeFood: isSlimmingWorldFreeFood(meal),
        speedFood: isSlimmingWorldSpeedFood(meal)
      }
    }

    // Bulletproof calculations
    dietInfo.bulletproof = {
      approved: isBulletproofApproved(meal),
      mct: containsMCT(meal),
      grassFed: containsGrassFed(meal)
    }

    // Intermittent Fasting calculations
    dietInfo.intermittentFasting = {
      breaksFast: meal.macros.calories > 50, // More than 50 calories breaks fast
      calories: meal.macros.calories
    }

    const docRef = await addDoc(collection(db, 'meals'), {
      ...meal,
      tags: [...(meal.tags || []), ...autoTags],
      dietInfo,
      createdAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving meal:', error)
    throw error
  }
}

// Diet-specific helper functions
function calculateSlimmingWorldSyns(meal: GeneratedMeal): number {
  let syns = 0
  
  // Basic calculation based on macros
  // 1 syn per 20 calories from fat
  syns += (meal.macros.fat * 9) / 20
  
  // Add syns for specific ingredients
  meal.ingredients.forEach(ing => {
    const name = ing.name.toLowerCase()
    if (name.includes('oil') || name.includes('butter')) {
      syns += 2 // Oils and fats are typically 2 syns per tsp
    }
    if (name.includes('sugar') || name.includes('syrup')) {
      syns += 1 // Sugars are typically 1 syn per tsp
    }
  })

  return Math.round(syns)
}

function isSlimmingWorldFreeFood(meal: GeneratedMeal): boolean {
  const freeFoodKeywords = ['lean meat', 'fish', 'eggs', 'vegetables', 'fruits', 'pasta', 'rice', 'potatoes']
  return meal.ingredients.some(ing => 
    freeFoodKeywords.some(keyword => ing.name.toLowerCase().includes(keyword))
  )
}

function isSlimmingWorldSpeedFood(meal: GeneratedMeal): boolean {
  const speedFoodKeywords = ['spinach', 'broccoli', 'tomatoes', 'peppers', 'carrots', 'onions']
  return meal.ingredients.some(ing => 
    speedFoodKeywords.some(keyword => ing.name.toLowerCase().includes(keyword))
  )
}

function isBulletproofApproved(meal: GeneratedMeal): boolean {
  const approvedKeywords = ['grass-fed', 'organic', 'wild-caught', 'pasture-raised']
  return meal.ingredients.some(ing => 
    approvedKeywords.some(keyword => ing.name.toLowerCase().includes(keyword))
  )
}

function containsMCT(meal: GeneratedMeal): boolean {
  return meal.ingredients.some(ing => 
    ing.name.toLowerCase().includes('mct') || 
    ing.name.toLowerCase().includes('coconut oil')
  )
}

function containsGrassFed(meal: GeneratedMeal): boolean {
  return meal.ingredients.some(ing => 
    ing.name.toLowerCase().includes('grass-fed') || 
    ing.name.toLowerCase().includes('grass fed')
  )
}

export async function getMealsByCategory(category: string) {
  try {
    const q = query(collection(db, 'meals'), where('category', '==', category))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc: DocumentData) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() // Convert Firestore Timestamp to Date
    })) as GeneratedMeal[]
  } catch (error) {
    console.error('Error getting meals:', error)
    throw error
  }
}

export async function getAllMeals() {
  try {
    const querySnapshot = await getDocs(collection(db, 'meals'))
    return querySnapshot.docs.map((doc: DocumentData) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() // Convert Firestore Timestamp to Date
    })) as GeneratedMeal[]
  } catch (error) {
    console.error('Error getting meals:', error)
    throw error
  }
}

export { db, analytics }
