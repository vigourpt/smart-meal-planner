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
}

export interface Ingredient {
  name: string
  amount: string
  estimatedCost: number
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
}

export async function saveMeal(meal: GeneratedMeal) {
  try {
    const docRef = await addDoc(collection(db, 'meals'), {
      ...meal,
      createdAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving meal:', error)
    throw error
  }
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
