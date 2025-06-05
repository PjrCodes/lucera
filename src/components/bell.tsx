"use client";
// This component listens for changes in the 'messages' collection
import NotificationListener from "@/components/notificationListener";
import { useState } from "react";
import { IoMdNotifications } from "react-icons/io";
export default function Bell() {
  // bell icon state
  const [bellState, setBellState] = useState(false);

  return (
    <>
    <NotificationListener onNotify={() => setBellState(true)} />
    <IoMdNotifications
      size={32}
      className={
        "cursor-pointer hover:text-gray-500 transition-colors duration-200 " +
        (bellState ? " text-red-500" : " text-gray-400")
      }
      onClick={() => {
        setBellState(false); // Reset bell state when clicked
      }}
    />
    </>
  );
}
