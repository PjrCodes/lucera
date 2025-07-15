"use client";

import { useEffect, useRef } from "react";
import { NotificationStreamData, ReminderNotification } from "@/lib/types/notifications";

interface NotificationListenerProps {
  onNotify: (data: NotificationStreamData) => void;
}

export default function NotificationListener({ onNotify }: NotificationListenerProps) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create EventSource connection to unified notification stream
    eventSourceRef.current = new EventSource("/api/notifications/stream");

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data: NotificationStreamData = JSON.parse(event.data);
        onNotify(data);
      } catch (error) {
        console.error("Error parsing notification data:", error);
      }
    };

    eventSourceRef.current.onerror = (error) => {
      console.error("Notification stream error:", error);
      
      // Reconnect after a delay
      setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = new EventSource("/api/notifications/stream");
        }
      }, 5000);
    };

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [onNotify]);

  // Check for reminder notifications every 30 minutes
  useEffect(() => {
    const checkReminders = async () => {
      try {
        const response = await fetch("/api/notifications/reminders");
        const data = await response.json();
        
        if (data.success && data.reminders.length > 0) {
          // Trigger notifications for each reminder
          data.reminders.forEach((reminder: ReminderNotification) => {
            onNotify({
              notification: reminder,
              unreadCount: data.count,
            });
          });
        }
      } catch (error) {
        console.error("Error checking reminders:", error);
      }
    };

    // Check immediately
    checkReminders();
    
    // Then check every 30 minutes
    const intervalId = setInterval(checkReminders, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [onNotify]);

  return null; // This component doesn't render anything
}
