import React from 'react'
import { useStore } from '../lib/store'
import { formatCurrency } from '../lib/currency'
import { RefreshCw, DollarSign, Check } from 'lucide-react'

export function ShoppingList() {
  const {
    currency,
    shoppingList,
    updateShoppingList,
    resetShoppingListSpending
  } = useStore(state => ({
    currency: state.settings.currency,
    shoppingList: state.shoppingList,
    updateShoppingList: state.updateShoppingList,
    resetShoppingListSpending: state.resetShoppingListSpending
  }))

  const estimatedTotal = shoppingList.reduce((total, item) => total + item.ingredient.estimatedCost, 0)
  const remainingTotal = shoppingList
    .filter(item => !item.purchased)
    .reduce((total, item) => total + item.ingredient.estimatedCost, 0)

  const handleTogglePurchased = (index: number) => {
    const updatedList = [...shoppingList]
    updatedList[index].purchased = !updatedList[index].purchased
    updateShoppingList(updatedList)
  }

  const handleUpdatePrice = (index: number, price: number) => {
    const updatedList = [...shoppingList]
    updatedList[index].ingredient.estimatedCost = price
    updateShoppingList(updatedList)
  }

  const handleUpdateAmount = (index: number, amount: string) => {
    const updatedList = [...shoppingList]
    updatedList[index].ingredient.amount = amount
    updateShoppingList(updatedList)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shopping List</h2>
          <div className="mt-1 flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>Remaining: {formatCurrency(remainingTotal, currency)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>Total: {formatCurrency(estimatedTotal, currency)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={resetShoppingListSpending}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset List
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {shoppingList.map((item, index) => (
            <li
              key={index}
              className={`px-6 py-4 ${
                item.purchased ? 'bg-gray-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleTogglePurchased(index)}
                    className={`p-1 rounded-full ${
                      item.purchased
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <div>
                    <h3 className={`text-sm font-medium ${
                      item.purchased ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {item.ingredient.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={item.ingredient.amount}
                        onChange={(e) => handleUpdateAmount(index, e.target.value)}
                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{currency}</span>
                  <input
                    type="number"
                    value={item.ingredient.estimatedCost}
                    onChange={(e) => handleUpdatePrice(index, parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
