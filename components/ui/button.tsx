"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-sc-primary text-white hover:bg-sc-primary/80 shadow-lg shadow-sc-primary/20":
              variant === "primary",
            "bg-white/10 text-white hover:bg-white/20 border border-white/10":
              variant === "secondary",
            "text-sc-muted hover:text-white hover:bg-white/5":
              variant === "ghost",
            "border border-sc-primary/30 text-sc-primary hover:bg-sc-primary/10":
              variant === "outline",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-8 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export default Button
