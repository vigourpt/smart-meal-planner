import React from 'react';
import { Bell, Globe, Moon, Key, DollarSign } from 'lucide-react';
import { useStore } from '../lib/store';
import { ApiKeyModal } from './ApiKeyModal';
import { CURRENCIES } from '../lib/constants';

export function Settings() {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = React.useState(false);
  const { settings, updateSettings } = useStore();
  const apiKey = useStore(state => state.apiKey);

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    if (currency) {
      updateSettings({
        currency: {
          code: currency.code,
          symbol: currency.symbol,
        },
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-emerald-600" />
            API Configuration
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50"
            >
              {apiKey ? 'Update OpenAI API Key' : 'Configure OpenAI API Key'}
            </button>
            {apiKey && (
              <div className="text-sm text-gray-600">
                API key is configured
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
            Currency
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select your preferred currency
              </label>
              <select
                value={settings.currency.code}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-emerald-600" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Email notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailNotifications}
                  onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Push notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.pushNotifications}
                  onChange={(e) => updateSettings({ pushNotifications: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-emerald-600" />
            Language & Region
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="en-US">English (US)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Moon className="h-5 w-5 mr-2 text-emerald-600" />
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.theme === 'dark'}
                  onChange={(e) => updateSettings({ theme: e.target.checked ? 'dark' : 'light' })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </section>
      </div>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
}
