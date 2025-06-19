import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder,
  className,
}: DropdownProps) {
  return (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger
        className={`
          bg-primary-50 border-2 border-primary-200 rounded px-3 py-2 w-full text-primary-900
          focus-visible:ring-2 focus-visible:ring-primary-300
          hover:border-primary-400
          ${className ?? ""}
        `}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white border border-primary-200 rounded shadow-lg">
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className={`
              px-3 py-2 cursor-pointer
              data-[state=checked]:bg-primary-100 data-[state=checked]:text-primary-900
              hover:bg-primary-50
              text-primary-900
            `}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
