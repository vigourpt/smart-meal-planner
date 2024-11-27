import React from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { MealCard } from './MealCard';
import { generateRecipeSuggestions } from '../lib/openai';
import { useStore } from '../lib/store';
import type { Recipe } from '../types';

interface RecipeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
}

interface StoreState {
  preferences: {
    dietaryPreferences: string[];
    allergies: string[];
    weeklyBudget: number;
    healthGoals?: string[];
  };
  apiKey: string;
}

export function RecipeSelector({ isOpen, onClose, onSelect }: RecipeSelectorProps): JSX.Element | null {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<Recipe[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  
  const preferences = useStore((state: StoreState) => state.preferences);
  const apiKey = useStore((state: StoreState) => state.apiKey);

  React.useEffect(() => {
    if (isOpen && apiKey) {
      loadSuggestions();
    }
  }, [isOpen, apiKey]);

  const loadSuggestions = async () => {
    if (!apiKey) {
      setError('Please configure your OpenAI API key in settings first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const suggestions = await generateRecipeSuggestions(preferences);
      setSuggestions(suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Select a Recipe</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <button 
              onClick={loadSuggestions}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                'Generate New Suggestions'
              )}
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error ? (
            <div className="text-red-600 text-center py-4">{error}</div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestions.map((recipe: Recipe) => (
                <div key={recipe.id || Math.random().toString()}>
                  <MealCard
                    recipe={recipe}
                    onSelect={onSelect}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
