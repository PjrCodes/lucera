import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  name?: string;
  children?: React.ReactNode;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder,
  className,
  name,
  children,
}: DropdownProps) {
  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      {children && <label className="text-sm text-gray-700">{children}</label>}
      <Select name={name} value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "flex items-center border border-gray-300 rounded px-2 py-1 text-sm text-gray-700",
            "transition-colors duration-200 hover:border-secondary-400 focus:outline-none focus:ring-2 focus:ring-secondary-300",
            value ? "bg-white" : "bg-transparent",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={cn(
            "bg-white border border-gray-300 rounded shadow-sm",
            "min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="px-2 py-1 text-sm text-gray-700 hover:bg-secondary-100 data-[state=checked]:bg-secondary-200"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
