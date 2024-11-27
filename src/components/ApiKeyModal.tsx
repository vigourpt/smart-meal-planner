import React, { useRef, useEffect } from 'react'
import { useStore } from '../lib/store'

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Enter OpenAI API Key</h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            placeholder="sk-..."
            className="w-full p-2 border rounded mb-4"
            defaultValue={apiKey || ''}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Save API Key
          </button>
        </form>
      </div>
    </div>
  )
}
