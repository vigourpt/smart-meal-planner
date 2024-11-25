import React from 'react';
import { Key } from 'lucide-react';
import { useStore } from '../lib/store';
import { initializeOpenAI } from '../lib/openai';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const setStoreApiKey = useStore(state => state.setApiKey);

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    try {
      initializeOpenAI(apiKey);
      setStoreApiKey(apiKey);
      setError(null);
      setApiKey('');
      onClose();
    } catch (err) {
      setError('Failed to initialize OpenAI client. Please check your API key.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-6">
          <Key className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">OpenAI API Key</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your OpenAI API key
            </label>
            <input
              ref={inputRef}
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="sk-..."
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="text-sm text-gray-500">
            Your API key is stored locally and never sent to our servers.
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setApiKey('');
                setError(null);
                onClose();
              }}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
