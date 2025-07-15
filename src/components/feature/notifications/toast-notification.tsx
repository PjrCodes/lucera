"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, Info, AlertTriangle, MessageCircle } from "lucide-react";
import { Notification } from "@/lib/types/notifications";

interface ToastNotificationProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

export function ToastNotification({ 
  notification, 
  onClose, 
  duration = 5000 
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case "message":
        return <MessageCircle className="w-5 h-5" />;
      case "announcement":
        return <Info className="w-5 h-5" />;
      case "grade_release":
        return <CheckCircle className="w-5 h-5" />;
      case "assignment_release":
        return <Info className="w-5 h-5" />;
      case "reminder_grade_assignment":
      case "reminder_deadline_approaching":
      case "reminder_upload_slides":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    switch (notification.type) {
      case "message":
        return `New message from ${notification.senderName}`;
      case "announcement":
        return `New announcement in ${notification.courseCode}`;
      case "grade_release":
        return `Grade released for ${notification.assignmentTitle}`;
      case "assignment_release":
        return `New assignment: ${notification.assignmentTitle}`;
      case "reminder_grade_assignment":
      case "reminder_deadline_approaching":
      case "reminder_upload_slides":
        return notification.title;
      default:
        return "Notification";
    }
  };

  const getDescription = () => {
    switch (notification.type) {
      case "message":
        return notification.message;
      case "announcement":
        return notification.title;
      case "grade_release":
        return `Your grade: ${notification.grade}`;
      case "assignment_release":
        return `Due: ${new Date(notification.dueDate).toLocaleDateString()}`;
      case "reminder_grade_assignment":
      case "reminder_deadline_approaching":
      case "reminder_upload_slides":
        return notification.description;
      default:
        return "";
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case "message":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "announcement":
        return "bg-primary-50 border-primary-200 text-primary-800";
      case "grade_release":
        return "bg-green-50 border-green-200 text-green-800";
      case "assignment_release":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "reminder_grade_assignment":
      case "reminder_deadline_approaching":
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "reminder_upload_slides":
        return "bg-purple-50 border-purple-200 text-purple-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg border shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${getColorClasses()}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {getTitle()}
          </p>
          <p className="text-xs mt-1 opacity-80">
            {getDescription()}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function NotificationToastContainer() {
  const [notifications, setNotifications] = useState<Array<{ id: string; notification: Notification }>>([]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="fixed top-0 right-0 z-50 space-y-2 p-4">
      {notifications.map(({ id, notification }) => (
        <ToastNotification
          key={id}
          notification={notification}
          onClose={() => removeNotification(id)}
        />
      ))}
    </div>
  );
}
