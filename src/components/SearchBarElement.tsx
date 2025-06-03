"use client";
import React, { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function SearchBarElement() {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      // Replace this with your LISA chat logic
      alert(`Message to LISA: ${input}`);
      setInput("");
    }
  };

  return (
    <div className="flex items-center border rounded-full px-2 py-1 bg-gray-200">
      <input
        type="text"
        className="outline-none px-2 py-1 w-64"
        placeholder="Search with LISA..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") handleSend();
        }}
      />
      <button
        className="ml-2 text-black hover:text-gray-500"
        onClick={handleSend}
        aria-label="Send to LISA"
      >
        <FaMagnifyingGlass  size={20} />
      </button>
    </div>
  );
}
