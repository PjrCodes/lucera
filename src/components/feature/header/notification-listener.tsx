"use client";

import { useEffect } from "react";

interface NotificationListenerProps {
  onNotify?: (data: unknown) => void;
}

export default function NotificationListener({ onNotify }: NotificationListenerProps) {
  // Simple placeholder - no complex notification logic
  useEffect(() => {
    // Just a simple placeholder that doesn't do anything expensive
    // This keeps the component interface intact but removes all slow operations
  }, [onNotify]);

  return null; // This component doesn't render anything
}
