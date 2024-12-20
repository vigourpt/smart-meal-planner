import React, { useEffect, useState } from 'react'
import { getAllMeals, getMealsByCategory, type GeneratedMeal } from '../lib/firebase'
import { Clock, TrendingUp, DollarSign, Users, Search, Tag, Plus, X, Calendar, Shield, Timer } from 'lucide-react'
import { useStore } from '../lib/store'
import { formatCurrency } from '../lib/currency'

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack'] as const
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const

const DEFAULT_TAGS = [
  'Quick & Easy',
  'High Protein',
  'Low Carb',
  'Vegetarian',
  'Vegan',
  'Gluten Free',
  'Dairy Free',
  'Budget Friendly',
  'Meal Prep',
  'Family Friendly',
  'Spicy',
  'Comfort Food'
] as const

type DefaultTag = typeof DEFAULT_TAGS[number]

interface AddToMealPlanModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (day: string, mealType: string) => void
}

function DietInfo({ meal }: { meal: GeneratedMeal }) {
  const { preferences } = useStore(state => ({
    preferences: state.preferences
  }))

  if (!preferences.dietPlan.type || !meal.dietInfo) return null

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      {preferences.dietPlan.type === 'slimming_world' && meal.dietInfo.slimmingWorld && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Syns:</span>
            <span className="text-sm">{meal.dietInfo.slimmingWorld.syns}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {meal.dietInfo.slimmingWorld.freeFood && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Free Food
              </span>
            )}
            {meal.dietInfo.slimmingWorld.speedFood && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Speed Food
              </span>
            )}
          </div>
        </div>
      )}

      {preferences.dietPlan.type === 'bulletproof' && meal.dietInfo.bulletproof && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${meal.dietInfo.bulletproof.approved ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-sm">Bulletproof Approved</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {meal.dietInfo.bulletproof.mct && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                MCT Oil
              </span>
            )}
            {meal.dietInfo.bulletproof.grassFed && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Grass-Fed
              </span>
            )}
          </div>
        </div>
      )}

      {preferences.dietPlan.type === 'intermittent_fasting' && meal.dietInfo.intermittentFasting && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Timer className={`h-4 w-4 ${meal.dietInfo.intermittentFasting.breaksFast ? 'text-red-500' : 'text-green-500'}`} />
            <span className="text-sm">
              {meal.dietInfo.intermittentFasting.breaksFast ? 'Breaks Fast' : 'Fast-Safe'}
            </span>
          </div>
          <div className="text-sm">
            Calories: {meal.dietInfo.intermittentFasting.calories}
          </div>
        </div>
      )}
    </div>
  )
}

function AddToMealPlanModal({ isOpen, onClose, onAdd }: AddToMealPlanModalProps) {
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[0])
  const [selectedMealType, setSelectedMealType] = useState<string>(MEAL_TYPES[0])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Add to Meal Plan</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            >
              {DAYS.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            >
              {MEAL_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onAdd(selectedDay, selectedMealType)
              onClose()
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
          >
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  )
}

export function SavedMeals() {
  const [meals, setMeals] = useState<GeneratedMeal[]>([])
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number] | 'all'>('all')
  const [selectedTags, setSelectedTags] = useState<(DefaultTag | string)[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [servingSizes, setServingSizes] = useState<Record<string, number>>({})
  const [addToMealPlanModal, setAddToMealPlanModal] = useState<{
    isOpen: boolean
    meal: GeneratedMeal | null
  }>({
    isOpen: false,
    meal: null
  })
  
  const {
    currency,
    defaultServings,
    updateMealInPlan,
    generateShoppingListFromMealPlan,
    mealPlan
  } = useStore(state => ({
    currency: state.settings.currency,
    defaultServings: state.preferences.servings,
    updateMealInPlan: state.updateMealInPlan,
    generateShoppingListFromMealPlan: state.generateShoppingListFromMealPlan,
    mealPlan: state.mealPlan
  }))

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const data = selectedCategory === 'all'
          ? await getAllMeals()
          : await getMealsByCategory(selectedCategory)
        setMeals(data)
        // Initialize serving sizes
        const initialServings = data.reduce((acc, meal) => ({
          ...acc,
          [meal.id!]: defaultServings
        }), {})
        setServingSizes(initialServings)
      } catch (error) {
        console.error('Error fetching meals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMeals()
  }, [selectedCategory, defaultServings])

  const adjustForServings = (value: number, originalServings: number, newServings: number): number => {
    return (value * newServings) / originalServings
  }

  const handleServingsChange = (mealId: string, servings: number) => {
    setServingSizes(prev => ({
      ...prev,
      [mealId]: servings
    }))
  }

  const handleAddToMealPlan = (day: string, mealType: string) => {
    if (!addToMealPlanModal.meal) return

    const servings = servingSizes[addToMealPlanModal.meal.id!] || defaultServings
    const adjustedMeal = {
      ...addToMealPlanModal.meal,
      macros: {
        calories: adjustForServings(addToMealPlanModal.meal.macros.calories, defaultServings, servings),
        protein: adjustForServings(addToMealPlanModal.meal.macros.protein, defaultServings, servings),
        carbs: adjustForServings(addToMealPlanModal.meal.macros.carbs, defaultServings, servings),
        fat: adjustForServings(addToMealPlanModal.meal.macros.fat, defaultServings, servings),
        fiber: adjustForServings(addToMealPlanModal.meal.macros.fiber, defaultServings, servings)
      },
      totalCost: adjustForServings(addToMealPlanModal.meal.totalCost, defaultServings, servings),
      ingredients: addToMealPlanModal.meal.ingredients.map(ing => ({
        ...ing,
        amount: ing.amount.replace(/\d+(\.\d+)?/g, (match) => {
          const num = parseFloat(match)
          return adjustForServings(num, defaultServings, servings).toFixed(2)
        }),
        estimatedCost: adjustForServings(ing.estimatedCost, defaultServings, servings)
      }))
    }

    updateMealInPlan(day, mealType, adjustedMeal, servings)
    if (mealPlan) {
      generateShoppingListFromMealPlan(mealPlan)
    }
  }

  const getAdjustedValues = (meal: GeneratedMeal) => {
    const servings = servingSizes[meal.id!] || defaultServings
    return {
      calories: adjustForServings(meal.macros.calories, defaultServings, servings),
      protein: adjustForServings(meal.macros.protein, defaultServings, servings),
      carbs: adjustForServings(meal.macros.carbs, defaultServings, servings),
      fat: adjustForServings(meal.macros.fat, defaultServings, servings),
      fiber: adjustForServings(meal.macros.fiber, defaultServings, servings),
      totalCost: adjustForServings(meal.totalCost, defaultServings, servings),
      ingredients: meal.ingredients.map(ing => ({
        ...ing,
        amount: ing.amount.replace(/\d+(\.\d+)?/g, (match) => {
          const num = parseFloat(match)
          return adjustForServings(num, defaultServings, servings).toFixed(2)
        }),
        estimatedCost: adjustForServings(ing.estimatedCost, defaultServings, servings)
      }))
    }
  }

  const toggleTag = (tag: DefaultTag | string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleAddCustomTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags(prev => [...prev, newTag.trim()])
      setSelectedTags(prev => [...prev, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveCustomTag = (tag: string) => {
    setCustomTags(prev => prev.filter(t => t !== tag))
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = searchQuery === '' || 
      meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => meal.tags?.includes(tag))

    return matchesSearch && matchesTags
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Saved Meals</h2>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search meals by name or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedCategory === 'all'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
                selectedCategory === category
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {DEFAULT_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedTags.includes(tag)
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </button>
            ))}
            {customTags.map(tag => (
              <div
                key={tag}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedTags.includes(tag)
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <button
                  onClick={() => toggleTag(tag)}
                  className="flex items-center"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </button>
                <button
                  onClick={() => handleRemoveCustomTag(tag)}
                  className="ml-2 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Custom Tag */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Add custom tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomTag()
                  }
                }}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              />
              <button
                onClick={handleAddCustomTag}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-emerald-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading meals...</p>
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No meals found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => {
            const adjustedValues = getAdjustedValues(meal)
            return (
              <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{meal.name}</h3>
                    <button
                      onClick={() => setAddToMealPlanModal({ isOpen: true, meal })}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full"
                      title="Add to Meal Plan"
                    >
                      <Calendar className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {meal.prepTime} min
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {meal.healthScore}/10
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(adjustedValues.totalCost, currency)}
                    </div>
                  </div>

                  {/* Diet-specific information */}
                  <DietInfo meal={meal} />

                  {/* Display meal tags */}
                  {meal.tags && meal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {meal.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center mb-4 space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <select
                      value={servingSizes[meal.id!] || defaultServings}
                      onChange={(e) => handleServingsChange(meal.id!, parseInt(e.target.value))}
                      className="text-sm border-gray-300 rounded-md"
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} servings</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Macros:</h4>
                      <div className="grid grid-cols-5 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="font-medium">{Math.round(adjustedValues.calories)}</div>
                          <div className="text-xs text-gray-500">kcal</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="font-medium">{Math.round(adjustedValues.protein)}g</div>
                          <div className="text-xs text-gray-500">protein</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="font-medium">{Math.round(adjustedValues.carbs)}g</div>
                          <div className="text-xs text-gray-500">carbs</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="font-medium">{Math.round(adjustedValues.fat)}g</div>
                          <div className="text-xs text-gray-500">fat</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="font-medium">{Math.round(adjustedValues.fiber)}g</div>
                          <div className="text-xs text-gray-500">fiber</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Ingredients:</h4>
                      <ul className="space-y-1">
                        {adjustedValues.ingredients.map((ingredient, index) => (
                          <li key={index} className="text-sm text-gray-600 flex justify-between">
                            <span>{ingredient.amount} {ingredient.name}</span>
                            <span className="text-gray-500">
                              {formatCurrency(ingredient.estimatedCost, currency)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Recipe:</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {meal.recipe}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AddToMealPlanModal
        isOpen={addToMealPlanModal.isOpen}
        onClose={() => setAddToMealPlanModal({ isOpen: false, meal: null })}
        onAdd={handleAddToMealPlan}
      />
    </div>
  )
}
