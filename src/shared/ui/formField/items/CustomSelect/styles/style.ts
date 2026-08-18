/* ============================================================
 *  CustomSelect — Reusable Style Sheet
 *  All class strings live here for better maintainability.
 * ============================================================ */

export const selectStyles = {
  /** Main control container */
  control:
    "flex w-full items-center min-h-[42px] justify-between rounded-xl border border-[#004066]/20 dark:border-[#004066]/40 bg-white dark:bg-[#061a29]/80 px-3.5 py-2.5 text-sm font-normal text-[#004066] dark:text-[#ebf7ff] transition-all duration-200 cursor-pointer hover:border-[#004066]/40 dark:hover:border-[#004066]/60 focus-within:border-[#0077be] dark:focus-within:border-[#0077be] focus-within:ring-4 focus-within:ring-[#0077be]/15 focus-within:outline-none shadow-2xs",

  /** Disabled state for control */
  disabled:
    "cursor-not-allowed bg-[#ebf7ff]/40 dark:bg-[#041829]/60 text-[#004066]/40 dark:text-[#ebf7ff]/40 opacity-75 border-[#004066]/10 dark:border-[#004066]/20 pr-10",

  /** Error state for control */
  error:
    "!border-rose-500 focus-within:!border-rose-500 focus-within:!ring-rose-500/10 bg-white dark:bg-[#061a29]/80",

  /** Inner content area */
  contentArea:
    "flex flex-wrap items-center gap-1.5 flex-1 min-w-0 py-0.5 relative",

  /** Multi-select badge */
  badge:
    "flex items-center gap-1 rounded-lg tracking-wide bg-[#0077be]/10 dark:bg-[#0077be]/25 border border-[#0077be]/20 px-2 py-0.5 text-xs font-medium text-[#0077be] dark:text-[#38bdf8] shrink-0",
  badgeIcon: "h-3 w-3 cursor-pointer hover:opacity-70 text-[#0077be] dark:text-[#38bdf8]",

  /** Selected label (single select) */
  selectedLabel:
    "flex-1 truncate text-sm font-normal text-[#004066] dark:text-[#ebf7ff] leading-5 pointer-events-none",

  /** Placeholder */
  placeholder:
    "absolute inset-y-0 left-0 flex items-center text-sm font-normal text-[#004066]/40 dark:text-[#ebf7ff]/40 leading-5 pointer-events-none truncate max-w-full",

  /** Search input */
  input:
    "bg-transparent outline-none p-0 text-[#004066] dark:text-[#ebf7ff] text-sm leading-5 min-w-0 placeholder:text-[#004066]/40",

  /** Right indicators container */
  indicators: "flex items-center gap-1.5 ml-2 text-[#004066]/50 dark:text-[#ebf7ff]/50 shrink-0",

  /** Dropdown menu */
  menu: "absolute z-[9999] left-0 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-[#004066]/15 dark:border-[#004066]/40 bg-white dark:bg-[#061a29] p-1.5 shadow-xl shadow-[#004066]/10 focus:outline-none backdrop-blur-md",

  /** Individual option */
  option:
    "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
  optionSelected: "bg-[#0077be]/10 dark:bg-[#0077be]/25 text-[#0077be] dark:text-[#38bdf8] font-semibold",
  optionHighlighted:
    "bg-[#ebf7ff] dark:bg-[#004066]/40 text-[#004066] dark:text-[#ebf7ff]",
  optionDefault: "text-[#004066] dark:text-[#ebf7ff] hover:bg-[#ebf7ff] dark:hover:bg-[#004066]/40",

  /** Messages (loading/no options) */
  message: "px-3 py-2 text-sm text-[#004066]/50 dark:text-[#ebf7ff]/50",
} as const;
