import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface SecondaryButtonProps
  extends React.ComponentProps<typeof Button> {
  variant?: "normal" | "outline"
}

export function SecondaryButton({
  variant = "normal",
  className,
  ...props
}: SecondaryButtonProps) {
  const variantClasses =
    variant === "outline"
      ? "border-2 border-purple-600 text-purple-600 bg-transparent cursor-pointer hover:bg-purple-100 hover:border-purple-700 hover:text-purple-700 hover:shadow-md transition focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
      : "border-2 border-purple-500 bg-purple-500 text-white cursor-pointer hover:bg-purple-600 transition focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2"

  return (
    <Button
      variant="default"
      className={cn(variantClasses, className)}
      {...props}
    />
  )
}
