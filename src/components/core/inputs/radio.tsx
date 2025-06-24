import * as React from "react";
import { RadioGroup as RadixRadioGroup, RadioGroupItem as RadixRadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface RadioGroupProps {
  name?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface RadioItemProps {
  value: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({
  name,
  defaultValue,
  value,
  onValueChange,
  className,
  children
}: RadioGroupProps) {
  return (
    <RadixRadioGroup
      name={name}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("grid gap-3", className)}
    >
      {children}
    </RadixRadioGroup>
  );
}

export function RadioItem({ value, id, children, className }: RadioItemProps) {
  const radioId = id || `radio-${value}`;

  return (
    <label htmlFor={radioId} className={cn("inline-flex items-center space-x-2", className)}>
      <RadixRadioGroupItem
        value={value}
        id={radioId}
        className={cn(
          "w-4 h-4 rounded-full border border-gray-300 transition-colors duration-200",
          "data-[state=checked]:bg-secondary-500 data-[state=checked]:border-secondary-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-300",
          "hover:border-secondary-400",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      />
      <span className="text-sm text-gray-700">
        {children}
      </span>
    </label>
  );
}
