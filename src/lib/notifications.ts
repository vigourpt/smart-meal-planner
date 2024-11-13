import { useStore } from './store';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function sendNotification(title: string, body: string) {
  const { settings } = useStore.getState();

  // Browser notifications
  if (settings.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/logo.png'
    });
  }

  // Email notifications
  if (settings.emailNotifications) {
    sendEmailNotification(title, body);
  }
}

async function sendEmailNotification(title: string, body: string) {
  // In a real app, you would integrate with an email service
  // For demo purposes, we'll just log the email
  console.log('Email notification:', { title, body });
}

export function setupNotificationListeners() {
  const { settings } = useStore.getState();

  if (settings.pushNotifications) {
    requestNotificationPermission();
  }

  // Set up periodic reminders
  setInterval(() => {
    const { mealPlan } = useStore.getState();
    if (mealPlan && mealPlan.currentSpending > mealPlan.weeklyBudget * 0.8) {
      sendNotification(
        'Budget Alert',
        'You have used 80% of your weekly budget!'
      );
    }
  }, 1000 * 60 * 60); // Check every hour
}