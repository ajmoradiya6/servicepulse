"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [settings, setSettings] = useState({
    notifications: {
      methods: {
        inApp: true,
        email: false,
        sms: false
      },
      levels: {
        warn: true,
        error: true
      },
      serviceStatus: {
        onStop: true,
        onStart: false,
        onRestart: true,
        onError: true
      },
      realTime: true,
      playSound: true,
      alertSound: "default",
      showLogs: true,
      logLevels: {
        warn: true,
        error: true
      }
    }
  });

  const playNotificationSound = useCallback(() => {
    if (settings.notifications.playSound) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(error => console.error('Error playing notification sound:', error));
    }
  }, [settings.notifications.playSound]);

  const notify = useCallback(({ 
    title, 
    message, 
    type = 'info', 
    serviceName = null,
    reason = null,
    timestamp = new Date(),
    logData = null
  }) => {
    // Check if notification should be shown based on settings
    if (!settings.notifications.levels[type]) {
      return;
    }

    // For service status notifications
    if (serviceName) {
      if (!settings.notifications.serviceStatus[type]) {
        return;
      }
    }

    // Play sound for critical notifications
    if (type === 'error' || type === 'warn') {
      playNotificationSound();
    }

    // Format the notification message
    let formattedMessage = message;
    if (serviceName) {
      formattedMessage = `Service "${serviceName}": ${message}`;
      if (reason) {
        formattedMessage += `\nReason: ${reason}`;
      }
    }

    // Add log data if available and enabled
    if (logData && settings.notifications.showLogs && settings.notifications.logLevels[type]) {
      formattedMessage += `\n\nRecent Logs:\n${logData}`;
    }

    // Show in-app notification
    if (settings.notifications.methods.inApp) {
      toast[type](formattedMessage, {
        description: title,
        duration: type === 'error' ? 5000 : 3000,
      });
    }

    // Send email notification if enabled
    if (settings.notifications.methods.email) {
      // TODO: Implement email notification
      console.log('Email notification would be sent:', {
        to: settings.email?.recipients,
        subject: `${settings.email?.subjectPrefix || '[Service Alert]'} ${title}`,
        body: formattedMessage
      });
    }
  }, [settings, playNotificationSound]);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, settings, updateSettings }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 