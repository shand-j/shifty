"use client"

import { cn } from "@/lib/utils"

interface ShiftyLogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  variant?: "full" | "icon"
}

export function ShiftyLogo({ className, size = "md", showText = true, variant = "full" }: ShiftyLogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 48, text: "text-2xl" },
    xl: { icon: 64, text: "text-3xl" },
  }

  const { icon: iconSize, text: textSize } = sizes[size]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Mark - Arrow pointing left (shift left) with quality shield */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(162, 72%, 45%)" />
            <stop offset="100%" stopColor="hsl(162, 72%, 35%)" />
          </linearGradient>
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(162, 90%, 55%)" />
            <stop offset="100%" stopColor="hsl(162, 72%, 45%)" />
          </linearGradient>
        </defs>

        {/* Main shield shape */}
        <path d="M32 4L8 16V34C8 46.5 18.5 57.5 32 60C45.5 57.5 56 46.5 56 34V16L32 4Z" fill="url(#logoGradient)" />

        {/* Left-pointing arrow (shift left concept) */}
        <path d="M38 22L24 32L38 42V36H46V28H38V22Z" fill="white" opacity="0.95" />

        {/* Subtle check mark integrated into arrow */}
        <path
          d="M18 32L22 36L28 30"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.8"
        />

        {/* Subtle quality lines */}
        <path d="M48 22V18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path d="M48 28V24" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      </svg>

      {/* Wordmark */}
      {showText && variant === "full" && (
        <span className={cn("font-bold tracking-tight text-foreground", textSize)}>
          Shift<span className="text-primary">y</span>
        </span>
      )}
    </div>
  )
}

// Animated version for loading states
export function ShiftyLogoAnimated({ className, size = "md" }: Omit<ShiftyLogoProps, "showText" | "variant">) {
  const sizes = {
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64,
  }

  const iconSize = sizes[size]

  return (
    <div className={cn("relative", className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-pulse"
      >
        <defs>
          <linearGradient id="logoGradientAnim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(162, 72%, 45%)" />
            <stop offset="100%" stopColor="hsl(162, 72%, 35%)" />
          </linearGradient>
        </defs>

        <path d="M32 4L8 16V34C8 46.5 18.5 57.5 32 60C45.5 57.5 56 46.5 56 34V16L32 4Z" fill="url(#logoGradientAnim)" />

        <path
          d="M38 22L24 32L38 42V36H46V28H38V22Z"
          fill="white"
          opacity="0.95"
          className="animate-[shift_1s_ease-in-out_infinite]"
        />

        <path
          d="M18 32L22 36L28 30"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.8"
        />
      </svg>

      <style jsx>{`
        @keyframes shift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-3px); }
        }
      `}</style>
    </div>
  )
}
