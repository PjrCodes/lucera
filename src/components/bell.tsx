"use client";
// This component listens for changes in the 'messages' collection

import client from "@/lib/db";
import { useState } from "react";
import { IoMdNotifications } from "react-icons/io";
export default function Bell() {
  // bell icon state
  const [bellState, setBellState] = useState(false);

  const db = client.db();
  const collection = db.collection("messages");
  const changeStream = collection.watch();
  changeStream
    .on("change", (next) => {
      // process next document
      // publish internal event
      console.log("Change detected:", next);
      setBellState(true); // Set bell state to true when a change is detected
    })
    .once("error", () => {
      // handle error
      console.error("Change stream error");
    });

  return (
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
  );
}
