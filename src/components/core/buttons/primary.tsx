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
      ? "border-2 border-primary-600 text-primary-600 bg-transparent cursor-pointer hover:bg-primary-50 hover:border-primary-700 hover:text-primary-700 hover:shadow-lg hover:scale-105 transition-transform focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2;"
      : "border-2 border-primary-500 bg-primary-500 text-white cursor-pointer hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2;";

  return (
    <Button
      variant={variant}
      className={cn(variantClasses, className)}
      {...props}
    />
  );
}
