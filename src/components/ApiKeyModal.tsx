import React from 'react';
import { Key } from 'lucide-react';
import { useStore } from '../lib/store';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = React.useState('');
  const setStoreApiKey = useStore(state => state.setApiKey);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreApiKey(apiKey);
    onClose();
  };

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
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="sk-..."
              required
            />
          </div>

          <div className="text-sm text-gray-500">
            Your API key is stored locally and never sent to our servers.
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
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