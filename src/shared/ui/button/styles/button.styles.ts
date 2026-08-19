import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  `relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[13px] font-medium transition-all
  focus:outline-none focus:ring-2 focus:ring-[#0077be] focus:ring-offset-2 dark:focus:ring-offset-[#061a29]
  disabled:pointer-events-none disabled:opacity-50 
  [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 cursor-pointer
  bg-[var(--btn-bg)] text-[var(--btn-text)] border-[var(--btn-border)]
  hover:bg-[var(--btn-hoverBg)] hover:text-[var(--btn-hoverText)]
  active:scale-[0.98]
  disabled:bg-[var(--btn-disabledBg)] disabled:text-[var(--btn-disabledText)]
  data-[loading=true]:text-transparent data-[loading=true]:[&>svg:not(.loader)]:opacity-0`,
  {
    variants: {
      variant: {
        primary: "bg-[#0077be] text-white hover:bg-[#00639e] active:bg-[#004f7e] shadow-sm shadow-[#0077be]/25 border border-transparent",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        secondary: "bg-[#004066]/10 text-[#004066] hover:bg-[#004066]/15 dark:bg-[#004066]/40 dark:text-[#ebf7ff] dark:hover:bg-[#004066]/60 border border-[#004066]/15",
        outline: "border border-[#004066]/20 bg-white text-[#004066] hover:bg-[#ebf7ff] hover:text-[#0077be] dark:border-[#0077be]/30 dark:bg-[#061a29] dark:text-[#ebf7ff] dark:hover:bg-[#082a43]",
        ghost: "text-[#004066] dark:text-[#ebf7ff] hover:bg-[#ebf7ff] hover:text-[#0077be] dark:hover:bg-[#0077be]/15",
      },
      size: {
        sm: "h-8 px-3 text-[12px]",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-[14px]",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);
