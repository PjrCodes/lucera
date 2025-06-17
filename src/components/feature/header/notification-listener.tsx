// components/NotificationListener.js
import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

type NotificationListenerProps = {
  onNotify?: (data: object) => void;
};

export default function NotificationListener({ onNotify }: NotificationListenerProps) {
  useEffect(() => {
    socket.on("new-notification", (data) => {
      console.log("🔔 Notification received:", data);
      onNotify?.(data);
    });

    return () => {
      socket.off("new-notification");
    };
  }, []);

  return null;
}
