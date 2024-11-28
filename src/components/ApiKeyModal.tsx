import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { Key } from 'lucide-react'

export function ApiKeyModal() {
  const [apiKey, setApiKey] = useState('')
  const setStoreApiKey = useStore(state => state.settings.setApiKey)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (apiKey.trim()) {
      setStoreApiKey(apiKey.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Key className="h-6 w-6 text-emerald-600" />
          <h3 className="text-lg font-medium text-gray-900">OpenAI API Key Required</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hidden username field for accessibility */}
          <div className="sr-only">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              tabIndex={-1}
              aria-hidden="true"
              style={{ display: 'none' }}
            />
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              Enter your OpenAI API Key
            </label>
            <div className="mt-1">
              <input
                type="password"
                name="apiKey"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md"
                required
                autoComplete="current-password"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Your API key is stored locally and never shared. You can get your API key from{' '}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-500"
              >
                OpenAI's website
              </a>
              .
            </p>
          </div>

          <div className="mt-5">
            <button
              type="submit"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Save API Key
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
