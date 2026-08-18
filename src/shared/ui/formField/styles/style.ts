/* ============================================================
 *  FormField — Reusable Style Sheet
 *  All class strings live here so FormField.tsx stays logic-only.
 * ============================================================ */

/* ── Shared base classes ───────────────────────────────────── */

export const formFieldBaseStyles = {
  /** Outer wrapper */
  wrapper: "flex flex-col gap-1.5 group",
  wrapperFull: "w-full",
  wrapperAuto: "w-auto",

  /** Top label (non-checkbox) */
  label:
    "text-sm font-semibold tracking-tight text-[#004066] dark:text-[#ebf7ff] transition-colors duration-200 group-focus-within:text-[#0077be] dark:group-focus-within:text-[#38bdf8]",
  labelDisabled: "opacity-60 cursor-not-allowed",

  /** Inline label (checkbox / radio) */
  inlineLabel:
    "text-sm font-medium text-[#004066] dark:text-[#ebf7ff] cursor-pointer transition-colors duration-200 group-focus-within:text-[#0077be] dark:group-focus-within:text-[#38bdf8]",
  inlineLabelDisabled: "cursor-not-allowed opacity-60",

  /** Required asterisk */
  requiredMark: "ml-1 text-rose-500 font-semibold",
  hint: "cursor-help text-[#004066]/40 hover:text-[#004066] dark:text-[#ebf7ff]/40 dark:hover:text-[#ebf7ff] transition-colors",

  /** Helper / error text */
  helperText: "text-xs font-medium mt-1 text-[#004066]/70 dark:text-[#ebf7ff]/70",
  errorText: "text-xs font-medium mt-1 text-rose-500 dark:text-rose-400 flex items-center gap-1",

  /** Shared text / textarea / input styles */
  input:
    "block w-full rounded-xl border border-[#004066]/20 dark:border-[#004066]/40 bg-white dark:bg-[#061a29]/80 px-3.5 py-2.5 text-sm font-normal text-[#004066] dark:text-[#ebf7ff] transition-all duration-200 min-h-[42px] placeholder:text-[#004066]/40 dark:placeholder:text-[#ebf7ff]/40 hover:border-[#004066]/40 dark:hover:border-[#004066]/60 focus:border-[#0077be] dark:focus:border-[#0077be] focus:outline-none focus:ring-4 focus:ring-[#0077be]/15 shadow-2xs",
  inputDisabled: "cursor-not-allowed bg-[#ebf7ff]/40 dark:bg-[#041829]/60 text-[#004066]/40 dark:text-[#ebf7ff]/40 opacity-75 border-[#004066]/10 dark:border-[#004066]/20 pr-10",
  inputError: "!border-rose-500 focus:!border-rose-500 focus:!ring-rose-500/10 bg-white dark:bg-[#061a29]/80",
  inputPII: "pr-10",

  /** Checkbox / radio input */
  checkboxInput:
    "h-4.5 w-4.5 rounded-md border-[#004066]/30 dark:border-[#004066]/50 text-[#0077be] transition-all focus:ring-4 focus:ring-[#0077be]/15 bg-white dark:bg-[#061a29] cursor-pointer",
  checkboxInputError: "!border-rose-500 text-rose-500 focus:ring-rose-500/10",

  radioInput:
    "h-4.5 w-4.5 border-[#004066]/30 dark:border-[#004066]/50 text-[#0077be] transition-all focus:ring-4 focus:ring-[#0077be]/15 cursor-pointer bg-white dark:bg-[#061a29]",
  radioInputError: "!border-rose-500 focus:ring-rose-500/10",

  /** Checkbox / radio row */
  toggleRow: "flex items-center gap-3 group",
  radioGroup: "flex flex-col gap-2",

  /** PII wrapper */
  piiWrapper: "relative w-full group",
  piiToggleButton:
    "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#004066]/50 hover:text-[#0077be] dark:hover:text-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#0077be]/20 transition-all",
  piiToggleButtonDisabled: "cursor-not-allowed opacity-50",
  piiIcon: "h-4 w-4",
} as const;
