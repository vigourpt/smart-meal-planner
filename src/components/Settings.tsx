import React from 'react'
import { useStore } from '../lib/store'
import { Key } from 'lucide-react'

const AVAILABLE_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
]

export function Settings() {
  const { 
    apiKey, 
    setApiKey, 
    currency, 
    setCurrency,
    weeklyBudget,
    updateWeeklyBudget
  } = useStore(state => ({
    apiKey: state.settings.apiKey,
    setApiKey: state.settings.setApiKey,
    currency: state.settings.currency,
    setCurrency: state.settings.setCurrency,
    weeklyBudget: state.preferences.weeklyBudget,
    updateWeeklyBudget: state.updateWeeklyBudget
  }))

  const handleApiKeySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newApiKey = formData.get('apiKey') as string
    if (newApiKey) {
      setApiKey(newApiKey)
    }
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value)
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0) {
      updateWeeklyBudget(value)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Key className="h-6 w-6 text-emerald-600" />
            <h3 className="text-lg font-medium text-gray-900">API Settings</h3>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleApiKeySubmit}>
              {/* Hidden username field for accessibility */}
              <div className="sr-only">
                <label htmlFor="settings-username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="settings-username"
                  name="username"
                  autoComplete="username"
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{ display: 'none' }}
                />
              </div>

              <label htmlFor="settings-apiKey" className="block text-sm font-medium text-gray-700">
                OpenAI API Key
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="settings-apiKey"
                  name="apiKey"
                  defaultValue={apiKey || ''}
                  placeholder="sk-..."
                  className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  autoComplete="current-password"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Your API key is stored locally and never shared.
                </p>
              </div>
              <div className="mt-3">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Save API Key
                </button>
              </div>
            </form>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={handleCurrencyChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
              >
                {AVAILABLE_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Weekly Budget ({AVAILABLE_CURRENCIES.find(c => c.code === currency)?.symbol})
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  value={weeklyBudget}
                  onChange={handleBudgetChange}
                  min="0"
                  step="0.01"
                  className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Set your weekly grocery budget to help track spending.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
