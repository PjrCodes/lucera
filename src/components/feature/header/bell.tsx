"use client";

import NotificationListener from "@/components/feature/header/notification-listener";
import { useState } from "react";
import { Bell as LucideBell, BellDot } from "lucide-react";

export default function Bell() {
  const [hasNotifications, setHasNotifications] = useState(false);

  // Simple bell toggle - no complex notification counting
  const handleNotification = () => {
    setHasNotifications(true);
  };

  const clearNotifications = () => {
    setHasNotifications(false);
  };

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
      </div>
    </>
  );
}
