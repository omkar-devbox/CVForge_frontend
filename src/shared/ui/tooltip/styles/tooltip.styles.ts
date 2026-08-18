/* ============================================================
 *  Tooltip — Styles
 * ============================================================ */

import type { TooltipVariant } from "../types/tooltip.types";

/**
 * Single source of truth for tooltip visual properties per variant.
 * Consolidates background, text, and arrow styles to reduce token waste.
 */
export const tooltipVariants: Record<
  TooltipVariant,
  { panel: string; arrow: string }
> = {
  dark: {
    panel: "bg-[#004066] text-[#ebf7ff]",
    arrow: "fill-[#004066]",
  },
  light: {
    panel: "bg-white text-[#004066] border border-[#004066]/15 shadow-lg",
    arrow: "fill-white [&>path]:stroke-[#004066]/15",
  },
  primary: {
    panel: "bg-[#0077be] text-white font-medium",
    arrow: "fill-[#0077be]",
  },
  success: {
    panel: "bg-emerald-600 text-white",
    arrow: "fill-emerald-600",
  },
  warning: {
    panel: "bg-amber-500 text-white",
    arrow: "fill-amber-500",
  },
  danger: {
    panel: "bg-rose-600 text-white",
    arrow: "fill-rose-600",
  },
  info: {
    panel: "bg-[#0077be] text-white",
    arrow: "fill-[#0077be]",
  },
};

export const tooltipBaseStyles = {
  triggerWrapper: "inline-block",
  panel:
    "z-[2000] px-3 py-1.5 text-xs font-medium rounded-md shadow-sm transition-opacity duration-200",
} as const;
