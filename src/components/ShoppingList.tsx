import React from 'react';
import { CheckCircle2, Circle, DollarSign, ShoppingBag, ArrowDownToLine, Filter, RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/currency';
import type { ShoppingList as ShoppingListType, ShoppingItem } from '../types';

const CATEGORIES = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Pantry',
  'Frozen',
  'Beverages',
  'Other'
];

export function ShoppingList() {
  const currency = useStore(state => state.settings.currency);
  const shoppingList = useStore(state => state.shoppingList);
  const updateShoppingList = useStore(state => state.updateShoppingList);
  const resetShoppingListSpending = useStore(state => state.resetShoppingListSpending);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const toggleItem = (itemId: string) => {
    if (!shoppingList) return;

    const updatedList: ShoppingListType = {
      ...shoppingList,
      items: shoppingList.items.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
      estimatedTotal: shoppingList.items.reduce((total, item) => {
        if (item.id === itemId) {
          return total + (item.checked ? -item.estimatedCost : item.estimatedCost);
        }
        return total + (item.checked ? item.estimatedCost : 0);
      }, 0)
    };

    updateShoppingList(updatedList);
  };

  const filteredItems = shoppingList?.items.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  const progress = shoppingList ? (shoppingList.estimatedTotal / shoppingList.totalBudget) * 100 : 0;

  if (!shoppingList) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          No shopping list available. Generate a meal plan to create a shopping list.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ShoppingBag className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Shopping List</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={resetShoppingListSpending}
            className="flex items-center px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Reset Spending
          </button>
          <button className="flex items-center px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
            <ArrowDownToLine className="h-5 w-5 mr-2" />
            Export List
          </button>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Budget Progress</span>
          <span className="text-sm font-medium text-emerald-600">
            {formatCurrency(shoppingList.estimatedTotal, currency.code)} / {formatCurrency(shoppingList.totalBudget, currency.code)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${progress > 100 ? 'bg-red-600' : 'bg-emerald-600'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all'
            ? 'px-3 py-1 rounded-full text-sm bg-emerald-600 text-white'
            : 'px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        >
          All
        </button>
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category
              ? 'px-3 py-1 rounded-full text-sm whitespace-nowrap bg-emerald-600 text-white'
              : 'px-3 py-1 rounded-full text-sm whitespace-nowrap bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          >
            {category}
          </button>
        ))}
      </div>

      {/* Shopping Items */}
      <div className="space-y-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleItem(item.id)}
                className="text-gray-400 hover:text-emerald-600"
              >
                {item.checked ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <div className={item.checked ? 'line-through text-gray-400' : ''}>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.amount} {item.unit} • {formatCurrency(item.estimatedCost, currency.code)}
                </p>
                {item.recipes.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Used in: {item.recipes.join(', ')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-emerald-600">
                {formatCurrency(item.estimatedCost, currency.code)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
