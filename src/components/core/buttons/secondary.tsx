import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SecondaryButtonProps
  extends React.ComponentProps<typeof Button> {
  variant?: "default" | "outline";
}

export function SecondaryButton({
  variant = "default",
  className,
  ...props
}: SecondaryButtonProps) {
  const variantClasses =
    variant === "outline"
      ? "border-2 border-secondary-600 text-secondary-600 bg-transparent cursor-pointer hover:bg-secondary-100 hover:border-secondary-700 hover:text-secondary-700 hover:shadow-md transition focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2"
      : "border-2 border-secondary-500 bg-secondary-500 text-white cursor-pointer hover:bg-secondary-600 transition focus-visible:ring-2 focus-visible:ring-secondary-300 focus-visible:ring-offset-2";

  return (
    <Button
      variant="default"
      className={cn(variantClasses, className)}
      {...props}
    />
  );
}
