/* ============================================================
 *  Loading — Light Mode Only (Clean Version)
 * ============================================================ */

export const loadingBaseStyles = {
  /** Wrapper */
  wrapper:
    "flex flex-col items-center justify-center bg-[#ebf7ff] dark:bg-[#03131e] transition-all duration-300",

  /** Fullscreen */
  fullScreen: "fixed inset-0 z-[10000]",

  /** Inline */
  inline: "w-full h-full min-h-[400px] rounded-3xl border border-[#004066]/15 bg-white dark:bg-[#061a29]",

  /** Card Layout */
  card: "flex flex-col items-center gap-[18px]",

  /** Logo */
  logo: "w-14 h-14 rounded-[14px] bg-gradient-to-br from-[#0077be] to-[#004066] flex items-center justify-center text-white font-bold text-xl shadow-[0_6px_18px_rgba(0,119,190,0.25)]",

  /** Loader Track */
  loader:
    "w-[110px] h-[3px] rounded-[10px] bg-[#004066]/15 dark:bg-[#004066]/40 overflow-hidden relative",

  /** Loader Moving Bar */
  loaderBar:
    "absolute inset-y-0 w-[35%] bg-gradient-to-r from-[#0077be] to-[#004066] animate-move",

  /** Text */
  text: "text-[11px] font-bold tracking-[0.18em] text-[#004066]/70 dark:text-[#ebf7ff]/70 uppercase",

  /** Skeleton wrapper */
  skeletonWrapper: "p-8 w-full max-w-7xl mx-auto",
} as const;
