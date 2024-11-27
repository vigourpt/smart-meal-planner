import React, { useRef, useEffect } from 'react'
import { useStore } from '../lib/store'
import { Key } from 'lucide-react'

export function ApiKeyModal() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { apiKey, setApiKey } = useStore(state => ({
    apiKey: state.settings.apiKey,
    setApiKey: state.settings.setApiKey
  }))

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputRef.current?.value) {
      setApiKey(inputRef.current.value)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
          <Key className="h-6 w-6 text-blue-600" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Enter OpenAI API Key
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              To use the meal planner, you need to provide your OpenAI API key.
              You can find your API key in your OpenAI account settings.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 sm:mt-6">
          <input
            ref={inputRef}
            type="password"
            placeholder="sk-..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            defaultValue={apiKey || ''}
          />
          <button
            type="submit"
            className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
          >
            Save API Key
          </button>
        </form>
      </div>
    </div>
  )
}
