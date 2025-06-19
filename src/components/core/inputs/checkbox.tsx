import * as React from "react";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onCheckedChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onCheckedChange(!checked);
        }
      }}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
        ${checked
          ? "bg-primary-500 border-primary-600 text-white"
          : "bg-white border-secondary-300 text-transparent"}
        focus-visible:ring-2 focus-visible:ring-primary-300
        hover:border-primary-400
        ${className ?? ""}
      `}
    >
      {checked && (
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 8.5l3 3 5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
