"use client";

import NotificationListener from "@/components/feature/header/notification-listener";
import { NotificationStreamData } from "@/lib/types/notifications";
import { useState, useEffect } from "react";
import { Bell as LucideBell, BellDot } from "lucide-react";

export default function Bell() {
  const [hasNotifications, setHasNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch("/api/notifications?unread=true");
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.unreadCount);
          setHasNotifications(data.unreadCount > 0);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();
  }, []);

  const handleNotification = (data: NotificationStreamData) => {
    setHasNotifications(true);
    setUnreadCount(data.unreadCount);
    
    // Show browser notification if permission is granted
    if (Notification.permission === "granted") {
      let title = "New Notification";
      let body = "";

      switch (data.notification.type) {
        case "message":
          title = "New Message";
          body = `From ${data.notification.senderName}: ${data.notification.message}`;
          break;
        case "announcement":
          title = "New Announcement";
          body = `${data.notification.title} - ${data.notification.courseName}`;
          break;
        case "grade_release":
          title = "Grade Released";
          body = `Your grade for "${data.notification.assignmentTitle}" is now available`;
          break;
        case "assignment_release":
          title = "New Assignment";
          body = `"${data.notification.assignmentTitle}" in ${data.notification.courseName}`;
          break;
        case "reminder_grade_assignment":
        case "reminder_deadline_approaching":
        case "reminder_upload_slides":
          title = data.notification.title;
          body = data.notification.description;
          break;
      }

      new Notification(title, { body });
    }
  };

  const clearNotifications = async () => {
    setHasNotifications(false);
    setUnreadCount(0);
    
    // Mark all notifications as read
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      <NotificationListener onNotify={handleNotification} />
      <div
        onClick={clearNotifications}
        className={
          "cursor-pointer rounded-lg p-1 transition hover:bg-secondary-50 relative " +
          (!hasNotifications ? "text-black" : "text-red-800 bg-red-100 rounded-xl")
        }
      >
        {!hasNotifications ? <LucideBell size={24} /> : <BellDot size={24} />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
    </>
  );
}
