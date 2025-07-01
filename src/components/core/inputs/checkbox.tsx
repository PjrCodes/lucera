import * as React from "react";
import { Checkbox as UICheckbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  children?: React.ReactNode;
  id?: string;
  name?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  className,
  children,
  id,
  name,
}: CheckboxProps) {
  const checkboxId = id || name;

  return (
    <label
      htmlFor={checkboxId}
      className={cn("inline-flex items-center space-x-2", className)}
    >
      <UICheckbox
        id={checkboxId}
        name={name}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "size-5 h-5 w-5 border rounded text-secondary-500",
          "border-gray-300 bg-white transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-300",
          "data-[state=checked]:bg-secondary-500 data-[state=checked]:border-secondary-500 data-[state=checked]:text-white",
          "hover:border-secondary-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />
      {children && <span className="text-sm text-gray-700">{children}</span>}
    </label>
  );
}
