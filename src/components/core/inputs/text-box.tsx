import React from "react";

interface TextBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}

export function TextBox({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: TextBoxProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`border rounded px-3 py-2 w-full ${className}`}
    />
  );
}
