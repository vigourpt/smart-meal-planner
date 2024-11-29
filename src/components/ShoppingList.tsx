import React, { useRef } from 'react'
import { useStore } from '../lib/store'
import { formatCurrency } from '../lib/currency'
import { RefreshCw, DollarSign, Check, Printer, Mail } from 'lucide-react'
import { PrintableView } from './PrintableView'
import ReactDOMServer from 'react-dom/server'

export function ShoppingList() {
  const {
    currency,
    shoppingList,
    updateShoppingList,
    resetShoppingListSpending,
    weeklyBudget
  } = useStore(state => ({
    currency: state.settings.currency,
    shoppingList: state.shoppingList,
    updateShoppingList: state.updateShoppingList,
    resetShoppingListSpending: state.resetShoppingListSpending,
    weeklyBudget: state.preferences.weeklyBudget
  }))

  const printFrameRef = useRef<HTMLIFrameElement>(null)

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

  const handlePrint = () => {
    const printContent = ReactDOMServer.renderToString(
      <html>
        <head>
          <title>Shopping List</title>
          <style>
            {`
              body { font-family: system-ui, -apple-system, sans-serif; }
              @media print {
                @page { margin: 2cm; }
              }
            `}
          </style>
        </head>
        <body>
          <PrintableView
            type="shoppinglist"
            data={shoppingList}
            currency={currency}
          />
        </body>
      </html>
    )

    const iframe = printFrameRef.current
    if (iframe) {
      const doc = iframe.contentDocument
      if (doc) {
        doc.open()
        doc.write(printContent)
        doc.close()
        iframe.contentWindow?.print()
      }
    }
  }

  const handleEmail = () => {
    const emailBody = shoppingList
      .map(item => `${item.ingredient.amount} ${item.ingredient.name} - ${formatCurrency(item.ingredient.estimatedCost, currency)}`)
      .join('%0D%0A') // URL-encoded newline
      + '%0D%0A%0D%0ATotal: ' + formatCurrency(estimatedTotal, currency)

    window.location.href = `mailto:?subject=Shopping List&body=${emailBody}`
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
              <span>Total: {formatCurrency(estimatedTotal, currency)} / {formatCurrency(weeklyBudget, currency)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            onClick={handleEmail}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </button>
          <button
            onClick={resetShoppingListSpending}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset List
          </button>
        </div>
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
          {shoppingList.length === 0 && (
            <li className="px-6 py-8 text-center text-gray-500">
              No items in shopping list. Add meals to your plan to generate a shopping list.
            </li>
          )}
        </ul>
      </div>

      {/* Hidden iframe for printing */}
      <iframe
        ref={printFrameRef}
        style={{ display: 'none' }}
        title="Print Frame"
      />
    </div>
  )
}
