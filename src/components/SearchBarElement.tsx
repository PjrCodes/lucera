"use client";
import React, { useRef, useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

type Props = {
  expanded?: boolean;
  setExpanded?: (val: boolean) => void;
};

export default function SearchBarElement({
  expanded: propExpanded,
  setExpanded: propSetExpanded,
}: Props) {
  const [input, setInput] = useState("");
  // Use controlled expanded state if provided, else fallback to internal state
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = propExpanded !== undefined ? propExpanded : internalExpanded;
  const setExpanded = propSetExpanded || setInternalExpanded;
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      // Replace this with your LISA chat logic
      alert(`Message to LISA: ${input}`);
      setInput("");
      setExpanded(false);
    }
  };

  // Collapse on click outside
  useEffect(() => {
    if (!expanded) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded, setExpanded]);

  // Focus input when expanded
  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  return (
    <div
      ref={containerRef}
      className={`flex items-center border rounded-full px-2 py-1 bg-gray-200 transition-all duration-200
        w-auto max-w-full sm:w-auto
        ${expanded ? "w-full" : ""}
      `}
      style={{
        width: expanded ? "100%" : undefined,
      }}
    >
      {/* Mobile: collapsed state */}
      <div className="block sm:hidden w-full">
        {!expanded ? (
          <button
            className="text-black hover:text-gray-500"
            onClick={() => setExpanded(true)}
            aria-label="Expand search"
          >
            <FaMagnifyingGlass size={20} />
          </button>
        ) : (
          <div className="flex items-center w-full">
            <input
              ref={inputRef}
              type="text"
              className="outline-none px-2 py-1 w-full transition-all duration-200"
              placeholder="Search with LISA..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
                if (e.key === "Escape") setExpanded(false);
              }}
            />
            <button
              className="ml-2 text-black hover:text-gray-500"
              onClick={handleSend}
              aria-label="Send to LISA"
            >
              <FaMagnifyingGlass size={20} />
            </button>
          </div>
        )}
      </div>
      {/* Desktop: always expanded */}
      <div className="hidden sm:flex items-center w-auto">
        <input
          type="text"
          className="outline-none px-2 py-1 w-64"
          placeholder="Search with LISA..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          className="ml-2 text-black hover:text-gray-500"
          onClick={handleSend}
          aria-label="Send to LISA"
        >
          <FaMagnifyingGlass size={20} />
        </button>
      </div>
    </div>
  );
}
