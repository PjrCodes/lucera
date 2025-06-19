"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
type Props = {
  expanded?: boolean;
  setExpanded?: (val: boolean) => void;
  onSearch?: (query: string) => void;
};

export default function SearchBarElement({
  expanded: propExpanded,
  setExpanded: propSetExpanded,
  onSearch,
}: Props) {
  const [input, setInput] = useState("");
  const router = useRouter();
  // Use controlled expanded state if provided, else fallback to internal state
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = propExpanded !== undefined ? propExpanded : internalExpanded;
  const setExpanded = propSetExpanded || setInternalExpanded;
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      if (onSearch) {
        onSearch(input);
      } else {
        // Navigate to LISA page with the query
        router.push(`/lisa?question=${encodeURIComponent(input)}`);
      }
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
      className={`flex items-center border rounded-full border-none px-2 py-1 sm:bg-secondary-50  transition-all duration-300
        text-black
        w-full
        sm:shadow-sm outline-none
        sm:focus-within:outline-solid outline-2 outline-lucerabrown-5

      `}
    >
      {/* Mobile: animated expansion */}
      <div className="block sm:hidden w-full relative h-10">
        {/* Collapsed button */}
        <button
          className={`absolute right-0 top-1/2 -translate-y-1/2 text-black hover:text-gray-600
            transition-all duration-300 ease-in-out hover:cursor-pointer
            ${expanded ? "opacity-0 pointer-events-none" : "opacity-100"}
          `}
          onClick={() => setExpanded(true)}
          aria-label="Expand search"
        >
          <Search size={24} />
        </button>
        {/* Expanded search container overlays the whole width */}
        <div className={`absolute left-0 top-0 w-full h-full flex items-center bg-secondary-50 shadow-sm rounded-full px-2 py-1
          transition-all duration-300 ease-in-out
          ${expanded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}>
          <input
            ref={inputRef}
            type="text"
            className="outline-none px-2 py-1 w-full bg-transparent transition-all duration-300 ease-in-out"
            placeholder="Search with LISA..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
              if (e.key === "Escape") setExpanded(false);
            }}
          />
          <button
            className="ml-2 text-black hover:text-gray-600 transition-all duration-300 ease-in-out flex items-center justify-center hover:cursor-pointer"
            onClick={handleSend}
            aria-label="Send to LISA"
          >
            <Search size={24} />
          </button>
        </div>
      </div>
      {/* Desktop: always expanded */}
      <div className="hidden sm:flex items-center w-auto">
        <input
          type="text"
          className="outline-none px-2 py-1 w-72 transition-all duration-300"
          placeholder="Search with LISA..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          className="ml-2 text-black hover:text-gray-600 transition-colors duration-200 flex items-center justify-center hover:cursor-pointer"
          onClick={handleSend}
          aria-label="Send to LISA"
        >
          <Search size={24} />
        </button>
      </div>
    </div>
  );
}
