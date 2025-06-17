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
      ? "border-2 border-yellow-600 text-yellow-600 bg-transparent cursor-pointer hover:bg-yellow-50 hover:border-yellow-700 hover:text-yellow-700 hover:shadow-lg hover:scale-105 transition-transform focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2;"
      : "border-2 border-yellow-500 bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600 focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2;";

  return (
    <Button
      variant={variant}
      className={cn(variantClasses, className)}
      {...props}
    />
  );
}
