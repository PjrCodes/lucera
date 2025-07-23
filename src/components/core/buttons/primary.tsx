import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PrimaryButtonProps
  extends React.ComponentProps<typeof Button> {
  /**
   * "normal" maps to solid yellow,
   * "outline" maps to transparent bg with yellow border/text
   */
  variant?: "default" | "outline";
}

export function PrimaryButton({
  variant = "default",
  className,
  ...props
}: PrimaryButtonProps) {
  const variantClasses =
    variant === "outline"
      ? "border-2 border-primary-700 text-primary-700 bg-transparent cursor-pointer hover:bg-primary-200 hover:border-primary-800 hover:text-primary-800 transition-transform focus-visible:ring-2 focus-visible:ring-primary-800 focus-visible:ring-offset-2 hover:shadow-lg"
      : "border-2 border-primary-400 bg-primary-500 text-primary-25 cursor-pointer hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 hover:shadow-lg";

  return (
    <Button
      variant={variant}
      className={cn(variantClasses, className)}
      {...props}
    />
  );
}
