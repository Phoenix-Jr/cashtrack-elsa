import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("relative shrink-0", sizeClasses[size])}>
        <img
          src="/image.png"
          alt="ELSA Logo"
          className="h-full w-full object-contain"
        />
      </div>
      {showText && (
        <span className={cn("font-bold text-[#0B177C] tracking-tight", textSizeClasses[size])}>
          ELSA
        </span>
      )}
    </div>
  )
}
