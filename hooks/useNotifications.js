/**
 * useNotifications Hook
 * Task List App 2026
 * 
 * React hook for managing notification state and listeners
 */

import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { 
  requestNotificationPermissions,
  scheduleTaskDueDateNotification,
  cancelNotification,
} from '../utils/notifications';

export default function useNotifications() {
  const [hasPermission, setHasPermission] = useState(false);
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Request permissions on mount
    checkPermissions();

    // Set up notification listeners (not on web)
    if (Platform.OS !== 'web') {
      // Listener for when a notification is received while app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          setNotification(notification);
          console.log('Notification received:', notification);
        }
      );

      // Listener for when user taps on a notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data;
          console.log('Notification tapped:', data);
          // Handle navigation to task here if needed
          handleNotificationResponse(data);
        }
      );
    }

    return () => {
      // Clean up listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const checkPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
    return granted;
  };

  const handleNotificationResponse = (data) => {
    if (data?.taskId) {
      // Could emit an event or use navigation here
      console.log('Should navigate to task:', data.taskId);
    }
  };

  /**
   * Schedule notification for a task with due date
   * Stores the notification ID on the task for later cancellation
   */
  const scheduleForTask = async (task) => {
    if (!hasPermission) {
      const granted = await checkPermissions();
      if (!granted) return null;
    }

    if (!task.dueDate) return null;

    const notificationId = await scheduleTaskDueDateNotification(task);
    return notificationId;
  };

  /**
   * Cancel notification for a task
   */
  const cancelForTask = async (notificationId) => {
    if (notificationId) {
      await cancelNotification(notificationId);
    }
  };

  return {
    hasPermission,
    notification,
    checkPermissions,
    scheduleForTask,
    cancelForTask,
  };
}
