import React from "react";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  maxLength?: number;
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength = 600,
  className = "",
}: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className={`border rounded px-3 py-1 w-full bg-white font-body border-secondary-700 outline-secondary-700 ${className}`}
    />
  );
}
