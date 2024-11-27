import React from 'react'
import { useStore } from '../lib/store'
import { formatCurrency } from '../lib/currency'

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

  const estimatedTotal = shoppingList.reduce((total, item) => total + item.price, 0)
  const remainingTotal = shoppingList
    .filter(item => !item.purchased)
    .reduce((total, item) => total + item.price, 0)

  const handleTogglePurchased = (index: number) => {
    const updatedList = [...shoppingList]
    updatedList[index].purchased = !updatedList[index].purchased
    updateShoppingList(updatedList)
  }

  const handleUpdatePrice = (index: number, price: number) => {
    const updatedList = [...shoppingList]
    updatedList[index].price = price
    updateShoppingList(updatedList)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Shopping List</h2>
          <p className="text-gray-600">
            Remaining: {formatCurrency(remainingTotal, currency)} / 
            Estimated Total: {formatCurrency(estimatedTotal, currency)}
          </p>
        </div>
        <button
          onClick={resetShoppingListSpending}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reset Spending
        </button>
      </div>

      <div className="space-y-4">
        {shoppingList.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              item.purchased ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={item.purchased}
                  onChange={() => handleTogglePurchased(index)}
                  className="h-5 w-5 text-blue-500"
                />
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.quantity} {item.unit}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span>{currency}</span>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleUpdatePrice(index, parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 border rounded"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
