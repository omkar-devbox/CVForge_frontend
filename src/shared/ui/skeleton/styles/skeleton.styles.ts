import { cva } from "class-variance-authority";

/**
 * Visual variants for the Skeleton component using class-variance-authority.
 * Centralizes styling logic, dark mode surface colors, staggered delays,
 * and reduced-motion accessibility.
 */
export const skeletonVariants = cva(
  [
    "relative overflow-hidden select-none pointer-events-none transition-all duration-300",
    // 60-30-10 theme-aware base colors
    "bg-[#004066]/10 dark:bg-[#004066]/30",
    // Motion accessibility: stop fast shimmer for reduced-motion users
    "motion-reduce:after:hidden motion-reduce:animate-pulse",
  ].join(" "),
  {
    variants: {
      variant: {
        rect: "rounded-md",
        circle: "rounded-full shrink-0",
        text: "rounded-sm h-4 mb-2 last:mb-0 w-full",
        square: "aspect-square rounded-md shrink-0",
        button: "rounded-md h-10 w-24 shrink-0",
        badge: "rounded-full h-5 w-16 shrink-0",
      },
      animation: {
        shimmer: [
          "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer",
          "after:bg-gradient-to-r after:from-transparent",
          "after:via-[var(--shimmer-highlight,rgba(255,255,255,0.45))] dark:after:via-[var(--shimmer-highlight,rgba(255,255,255,0.07))]",
          "after:to-transparent",
        ].join(" "),
        pulse: "animate-pulse",
        wave: [
          "after:absolute after:inset-0 after:-translate-x-full",
          "after:bg-gradient-to-r after:from-transparent after:via-white/30 dark:after:via-white/10 after:to-transparent",
          "after:animate-[shimmer_1.6s_infinite_cubic-bezier(0.4,0,0.6,1)]",
        ].join(" "),
        none: "",
      },
    },
    defaultVariants: {
      variant: "rect",
      animation: "shimmer",
    },
  }
);
