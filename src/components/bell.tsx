"use client";
// This component listens for changes in the 'messages' collection
import NotificationListener from "@/components/notification-listener";

import { useState } from "react";
import { Bell as LucideBell, BellDot } from "lucide-react";

export default function Bell() {
  // bell icon state
  const [bellState, setBellState] = useState(false);

  return (
    <>
      <NotificationListener onNotify={() => setBellState(true)} />
      <div
        onClick={() => setBellState(false)}
        className={
          "cursor-pointer rounded-lg p-1 transition hover:bg-lucerabrown-1 " + (!bellState ? "text-black" : "text-red-800 bg-red-100 rounded-xl")
        }
      >
        {!bellState ? <LucideBell size={26} /> :
        <BellDot size={26} />}
      </div>
    </>
  );
}
