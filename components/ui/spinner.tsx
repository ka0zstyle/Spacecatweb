import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "border-2 border-sc-primary/30 border-t-sc-primary rounded-full animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]",
        {
          "w-4 h-4": size === "sm",
          "w-6 h-6": size === "md",
          "w-8 h-8": size === "lg",
        },
        className
      )}
    />
  )
}
