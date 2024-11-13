import React from 'react';
import { User, Heart, Clock, DollarSign, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/currency';

const DIETARY_PREFERENCES = [
  'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Mediterranean',
  'Low-Carb', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher'
];

const HEALTH_GOALS = [
  'Weight Loss', 'Weight Gain', 'Muscle Gain', 'More Protein',
  'Lower Carbs', 'Heart Health', 'Better Sleep', 'More Energy',
  'Digestive Health', 'Blood Sugar Control'
];

const COMMON_ALLERGIES = [
  'Nuts', 'Peanuts', 'Milk', 'Eggs', 'Soy', 'Wheat',
  'Fish', 'Shellfish', 'Sesame'
];

export function Profile() {
  const darkMode = useStore(state => state.settings.darkMode);
  const currency = useStore(state => state.settings.currency);
  const { preferences, updatePreferences } = useStore();
  const [showPreferenceModal, setShowPreferenceModal] = React.useState(false);
  const [showAllergyModal, setShowAllergyModal] = React.useState(false);
  const [showGoalModal, setShowGoalModal] = React.useState(false);

  const addPreference = (pref: string) => {
    if (!preferences.dietaryPreferences.includes(pref)) {
      updatePreferences({
        dietaryPreferences: [...preferences.dietaryPreferences, pref]
      });
    }
    setShowPreferenceModal(false);
  };

  const removePreference = (pref: string) => {
    updatePreferences({
      dietaryPreferences: preferences.dietaryPreferences.filter(p => p !== pref)
    });
  };

  const addAllergy = (allergy: string) => {
    if (!preferences.allergies.includes(allergy)) {
      updatePreferences({
        allergies: [...preferences.allergies, allergy]
      });
    }
    setShowAllergyModal(false);
  };

  const removeAllergy = (allergy: string) => {
    updatePreferences({
      allergies: preferences.allergies.filter(a => a !== allergy)
    });
  };

  const addGoal = (goal: string) => {
    if (!preferences.healthGoals?.includes(goal)) {
      updatePreferences({
        healthGoals: [...(preferences.healthGoals || []), goal]
      });
    }
    setShowGoalModal(false);
  };

  const removeGoal = (goal: string) => {
    updatePreferences({
      healthGoals: preferences.healthGoals?.filter(g => g !== goal)
    });
  };

  return (
    <div className={`max-w-4xl mx-auto rounded-xl shadow-lg p-6 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-emerald-100 p-4 rounded-full">
          <User className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            My Profile
          </h2>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-500'}>
            Manage your preferences and dietary requirements
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="space-y-4">
          <h3 className={`text-lg font-semibold flex items-center ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Heart className="h-5 w-5 mr-2 text-emerald-600" />
            Dietary Preferences
          </h3>
          <div className="flex flex-wrap gap-2">
            {preferences.dietaryPreferences.map(pref => (
              <span key={pref} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm flex items-center">
                {pref}
                <button
                  onClick={() => removePreference(pref)}
                  className="ml-2 text-emerald-600 hover:text-emerald-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => setShowPreferenceModal(true)}
              className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full text-sm hover:border-emerald-500 hover:text-emerald-500"
            >
              + Add Preference
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className={`text-lg font-semibold flex items-center ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Clock className="h-5 w-5 mr-2 text-emerald-600" />
            Weekly Budget
          </h3>
          <div className="flex items-center space-x-2">
            <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>
              {currency.symbol}
            </span>
            <input
              type="number"
              value={preferences.weeklyBudget}
              onChange={(e) => updatePreferences({
                weeklyBudget: Number(e.target.value)
              })}
              className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'
              }`}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Allergies
          </h3>
          <div className="flex flex-wrap gap-2">
            {preferences.allergies.map(allergy => (
              <span key={allergy} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm flex items-center">
                {allergy}
                <button
                  onClick={() => removeAllergy(allergy)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => setShowAllergyModal(true)}
              className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full text-sm hover:border-red-500 hover:text-red-500"
            >
              + Add Allergy
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Health Goals
          </h3>
          <div className="flex flex-wrap gap-2">
            {preferences.healthGoals?.map(goal => (
              <span key={goal} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center">
                {goal}
                <button
                  onClick={() => removeGoal(goal)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => setShowGoalModal(true)}
              className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full text-sm hover:border-blue-500 hover:text-blue-500"
            >
              + Add Goal
            </button>
          </div>
        </section>
      </div>

      {/* Preference Modal */}
      {showPreferenceModal && (
        <SelectionModal
          title="Add Dietary Preference"
          options={DIETARY_PREFERENCES}
          onSelect={addPreference}
          onClose={() => setShowPreferenceModal(false)}
          darkMode={darkMode}
        />
      )}

      {/* Allergy Modal */}
      {showAllergyModal && (
        <SelectionModal
          title="Add Allergy"
          options={COMMON_ALLERGIES}
          onSelect={addAllergy}
          onClose={() => setShowAllergyModal(false)}
          darkMode={darkMode}
        />
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <SelectionModal
          title="Add Health Goal"
          options={HEALTH_GOALS}
          onSelect={addGoal}
          onClose={() => setShowGoalModal(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

interface SelectionModalProps {
  title: string;
  options: string[];
  onSelect: (option: string) => void;
  onClose: () => void;
  darkMode: boolean;
}

function SelectionModal({ title, options, onSelect, onClose, darkMode }: SelectionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-md rounded-lg p-6 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {options.map(option => (
            <button
              key={option}
              onClick={() => onSelect(option)}
              className={`p-2 rounded-lg text-sm text-left hover:bg-emerald-50 hover:text-emerald-700 ${
                darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className={`mt-4 px-4 py-2 rounded-lg ${
            darkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}