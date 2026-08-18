import { cva } from "class-variance-authority";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import type { ToastVariant, ToastPosition } from "../types/toast.types";

/* ---------------------------------- */
/* TYPES */
/* ---------------------------------- */

export interface NotificationVariantConfig {
  icon: LucideIcon;
  badgeBgClass: string;
  badgeTextClass: string;
  progressClass: string;
  animate?: string;
}

/* ---------------------------------- */
/* VARIANT CONFIG (Minimalist Sonner / Vercel Aesthetic) */
/* ---------------------------------- */

export const NOTIFICATION_CONFIG: Record<
  ToastVariant,
  NotificationVariantConfig
> = {
  success: {
    icon: CheckCircle2,
    badgeBgClass: "bg-emerald-500/10 dark:bg-emerald-500/20",
    badgeTextClass: "text-emerald-600 dark:text-emerald-400",
    progressClass: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    badgeBgClass: "bg-rose-500/10 dark:bg-rose-500/20",
    badgeTextClass: "text-rose-600 dark:text-rose-400",
    progressClass: "bg-rose-500",
  },
  warning: {
    icon: AlertTriangle,
    badgeBgClass: "bg-amber-500/10 dark:bg-amber-500/20",
    badgeTextClass: "text-amber-600 dark:text-amber-400",
    progressClass: "bg-amber-500",
  },
  info: {
    icon: Info,
    badgeBgClass: "bg-[#0077be]/10 dark:bg-[#0077be]/20",
    badgeTextClass: "text-[#0077be] dark:text-[#38bdf8]",
    progressClass: "bg-[#0077be]",
  },
  loading: {
    icon: Loader2,
    badgeBgClass: "bg-[#0077be]/10 dark:bg-[#0077be]/20",
    badgeTextClass: "text-[#0077be] dark:text-[#38bdf8]",
    progressClass: "bg-[#0077be]",
    animate: "animate-spin",
  },
};

/* ---------------------------------- */
/* POSITION MAP */
/* ---------------------------------- */

export const POSITION_MAP: Record<ToastPosition, string> = {
  "top-right": "top-5 right-5 items-end",
  "top-left": "top-5 left-5 items-start",
  "top-center": "top-5 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-5 right-5 items-end",
  "bottom-left": "bottom-5 left-5 items-start",
  "bottom-center": "bottom-5 left-1/2 -translate-x-1/2 items-center",
};

/* ---------------------------------- */
/* MAIN CARD */
/* ---------------------------------- */

export const notificationVariants = cva(
  `
  group relative flex items-start gap-3 p-3.5
  w-full min-w-[320px] max-w-[400px]
  rounded-xl border border-[#004066]/15 dark:border-[#004066]/40
  bg-white/95 dark:bg-[#061a29]/95
  text-[#004066] dark:text-[#ebf7ff]
  shadow-lg shadow-[#004066]/10 dark:shadow-black/40
  backdrop-blur-md overflow-hidden
  transition-all duration-200 ease-out
  pointer-events-auto select-none
  `,
  {
    variants: {
      exiting: {
        true: "opacity-0 scale-95 translate-y-1 pointer-events-none",
        false: "opacity-100 scale-100 translate-y-0",
      },
    },
    defaultVariants: {
      exiting: false,
    },
  },
);

/* ---------------------------------- */
/* UI ELEMENTS */
/* ---------------------------------- */

export const NOTIFICATION_UI = {
  container: "w-full max-w-[400px] pointer-events-auto",

  iconBadgeContainer:
    "flex-shrink-0 size-8 rounded-full flex items-center justify-center transition-colors duration-200 mt-0.5",

  closeButton: `
    flex-shrink-0 size-6 rounded-md flex items-center justify-center -mr-1 -mt-0.5
    text-[#004066]/50 hover:text-[#004066] dark:text-[#ebf7ff]/50 dark:hover:text-[#ebf7ff]
    hover:bg-[#ebf7ff] dark:hover:bg-[#004066]/40 active:scale-95
    transition-all cursor-pointer
    `,

  actionButton: `
    inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-md
    bg-[#0077be] hover:bg-[#00639e] text-white
    border border-[#0077be]/40 transition-colors cursor-pointer active:scale-95
    `,

  progressBarTrack:
    "absolute bottom-0 left-0 w-full h-[2.5px] bg-[#004066]/10 dark:bg-[#004066]/30 overflow-hidden",

  progressBar: `
    h-full w-full origin-left
    transition-all ease-linear
    `,
};
