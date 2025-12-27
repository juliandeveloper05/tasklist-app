/**
 * Notification Service - Local Notifications
 * Task List App 2026
 * 
 * Handles scheduling, canceling, and managing local notifications
 * for task reminders.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 * @returns {Promise<boolean>} - Whether permissions were granted
 */
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') {
    // Web notifications require different handling
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push notification permissions');
    return false;
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#667eea',
      sound: 'default',
    });
  }

  return true;
}

/**
 * Schedule a notification for a task
 * @param {Object} task - The task object
 * @param {Date} reminderTime - When to send the notification
 * @returns {Promise<string|null>} - Notification identifier or null
 */
export async function scheduleTaskNotification(task, reminderTime) {
  if (!task || !reminderTime) return null;

  // Don't schedule if time is in the past
  if (reminderTime <= new Date()) {
    console.log('Cannot schedule notification in the past');
    return null;
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Recordatorio de tarea',
        body: task.title,
        data: { 
          taskId: task.id,
          type: 'task-reminder',
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: 'task-reminder',
      },
      trigger: {
        date: reminderTime,
        channelId: 'task-reminders',
      },
    });

    console.log('Notification scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Schedule a notification for task due date
 * Sends notification at 9:00 AM on the due date
 * @param {Object} task - The task object with dueDate
 * @returns {Promise<string|null>} - Notification identifier or null
 */
export async function scheduleTaskDueDateNotification(task) {
  if (!task || !task.dueDate) return null;

  const dueDate = new Date(task.dueDate);
  
  // Set reminder to 9:00 AM on the due date
  const reminderTime = new Date(dueDate);
  reminderTime.setHours(9, 0, 0, 0);

  // If it's already past 9 AM on the due date, schedule for now + 1 minute
  const now = new Date();
  if (reminderTime <= now) {
    // If same day but past 9 AM, schedule for 1 hour from now
    if (dueDate.toDateString() === now.toDateString()) {
      reminderTime.setTime(now.getTime() + 60 * 60 * 1000);
    } else {
      // Due date is in the past, don't schedule
      return null;
    }
  }

  return scheduleTaskNotification(task, reminderTime);
}

/**
 * Cancel a scheduled notification
 * @param {string} notificationId - The notification identifier
 */
export async function cancelNotification(notificationId) {
  if (!notificationId) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 * @returns {Promise<Array>} - Array of scheduled notifications
 */
export async function getScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Send an immediate notification (for testing)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 */
export async function sendImmediateNotification(title, body) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null, // null means immediate
    });
  } catch (error) {
    console.error('Error sending immediate notification:', error);
  }
}

export default {
  requestNotificationPermissions,
  scheduleTaskNotification,
  scheduleTaskDueDateNotification,
  cancelNotification,
  cancelAllNotifications,
  getScheduledNotifications,
  sendImmediateNotification,
};
