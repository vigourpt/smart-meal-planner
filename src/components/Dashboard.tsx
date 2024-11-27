import React from 'react';
import { Utensils, DollarSign, Clock, TrendingUp, RefreshCw, Wand2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/currency';
import { generateFullMealPlan } from '../lib/openai';
import { sendNotification } from '../lib/notifications';

export function Dashboard() {
  const { settings, mealPlan, preferences, updateMealPlan } = useStore();
  const [loading, setLoading] = React.useState(false);

  const handleResetSpending = () => {
    updateMealPlan({
      ...mealPlan!,
      currentSpending: 0
    });
    sendNotification('Spending Reset', 'Your weekly spending has been reset to 0.');
  };

  const handleAutoGenerate = async () => {
    try {
      setLoading(true);
      const newPlan = await generateFullMealPlan(preferences);
      updateMealPlan(newPlan);
      sendNotification('Meal Plan Generated', 'Your new meal plan is ready!');
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          icon={<Utensils className="h-6 w-6 text-emerald-600" />}
          title="Weekly Meals"
          value={`${mealPlan?.mealsPlanned || 0}/21`}
          subtitle="Meals Planned"
          gradient="from-emerald-500 to-teal-600"
        />
        <DashboardCard
          icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
          title="Budget"
          value={`${formatCurrency(mealPlan?.currentSpending || 0, settings.currency.code)}/${formatCurrency(preferences.weeklyBudget, settings.currency.code)}`}
          subtitle="Weekly Spending"
          gradient="from-blue-500 to-indigo-600"
        />
        <DashboardCard
          icon={<Clock className="h-6 w-6 text-emerald-600" />}
          title="Prep Time"
          value="45 min"
          subtitle="Avg. per Meal"
          gradient="from-purple-500 to-pink-600"
        />
        <DashboardCard
          icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
          title="Health Score"
          value="8.5/10"
          subtitle="Based on Nutrition"
          gradient="from-orange-500 to-red-600"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleResetSpending}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Reset Spending
        </button>
        <button
          onClick={handleAutoGenerate}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50"
        >
          <Wand2 className="h-5 w-5 mr-2" />
          {loading ? 'Generating...' : 'Auto Generate Plan'}
        </button>
      </div>

      {/* Quick Start Guide */}
      <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
        <h3 className="text-xl font-semibold text-emerald-800 mb-4">Quick Start Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GuideStep
            number="1"
            title="Set Your Preferences"
            description="Visit your profile to set dietary preferences, allergies, and health goals."
          />
          <GuideStep
            number="2"
            title="Configure Budget"
            description="Set your weekly budget and preferred currency in settings."
          />
          <GuideStep
            number="3"
            title="Plan Your Meals"
            description="Use Auto Generate or manually select meals for your week."
          />
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  gradient: string;
}

function DashboardCard({ icon, title, value, subtitle, gradient }: DashboardCardProps) {
  return (
    <div className={`bg-gradient-to-r ${gradient} text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all`}>
      <div className="flex items-center justify-between">
        {icon}
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm opacity-80">{subtitle}</p>
      </div>
    </div>
  );
}

interface GuideStepProps {
  number: string;
  title: string;
  description: string;
}

function GuideStep({ number, title, description }: GuideStepProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold">
        {number}
      </div>
      <div>
        <h4 className="font-medium text-emerald-800">{title}</h4>
        <p className="text-sm text-emerald-600">{description}</p>
      </div>
    </div>
  );
}