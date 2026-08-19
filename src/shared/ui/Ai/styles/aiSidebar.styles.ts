import { cn } from "@/shared/lib/utils";

/**
 * Main AI Sidebar Container Styles
 */
export const aiSidebarStyles = {
  aside: (isResizing: boolean, side: "left" | "right" = "right") =>
    cn(
      "h-screen bg-[#ebf7ff] dark:bg-[#03131e] flex flex-col shrink-0 overflow-hidden isolate z-30 transform-gpu will-change-[width,opacity]",
      "lg:relative lg:top-auto lg:h-full lg:z-auto",
      "max-lg:fixed max-lg:top-0 max-lg:z-50",
      side === "left"
        ? "left-0 border-r border-[#004066]/15 dark:border-[#004066]/40"
        : "right-0 border-l border-[#004066]/15 dark:border-[#004066]/40",
    ),
  resizeHandle: (isResizing: boolean, side: "left" | "right" = "right") =>
    cn(
      "absolute top-0 bottom-0 w-1.5 cursor-col-resize z-50 group hidden lg:block",
      side === "left" ? "right-0" : "left-0",
      "hover:bg-[#0077be]/20 transition-colors",
      isResizing && "bg-[#0077be]/30 w-1.5",
    ),
  resizeIndicator: (isResizing: boolean, side: "left" | "right" = "right") =>
    cn(
      "absolute top-1/2 -translate-y-1/2 w-[2px] h-10 rounded-full bg-[#004066]/30 dark:bg-[#ebf7ff]/30 transition-all",
      side === "left" ? "right-0" : "left-0",
      isResizing
        ? "bg-[#0077be] h-full"
        : "group-hover:bg-[#0077be] group-hover:h-12",
    ),
};

/**
 * AI Sidebar Header Styles
 */
export const aiSidebarHeaderStyles = {
  root: "h-16 px-6 border-b border-[#004066]/15 dark:border-[#004066]/40 flex items-center justify-between bg-[#ebf7ff]/90 dark:bg-[#061a29]/90 backdrop-blur-md shrink-0",
  iconWrapper: "w-10 h-10 rounded-2xl bg-[#0077be]/10 dark:bg-[#0077be]/25 flex items-center justify-center text-[#0077be] dark:text-[#38bdf8] shadow-sm",
  titleWrapper: "flex flex-col",
  title: "text-sm font-bold text-[#004066] dark:text-[#ebf7ff] tracking-tight leading-none mb-1",
  subtitle: "text-[11px] text-[#004066]/60 dark:text-[#ebf7ff]/60 font-medium uppercase tracking-wider",
  closeButton: "p-2 hover:bg-[#0077be]/10 dark:hover:bg-[#004066]/40 rounded-xl text-[#004066]/60 dark:text-[#ebf7ff]/60 hover:text-[#004066] dark:hover:text-[#ebf7ff] transition-all active:scale-95",
};

/**
 * AI Chat Area Styles
 */
export const aiChatAreaStyles = {
  root: "flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide",
  emptyState: {
    wrapper: "flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-500",
    icon: "w-16 h-16 rounded-3xl bg-[#0077be]/10 dark:bg-[#0077be]/25 flex items-center justify-center text-[#0077be] dark:text-[#38bdf8] rotate-3 shadow-inner",
    content: "space-y-2 max-w-[280px]",
    title: "text-lg font-bold text-[#004066] dark:text-[#ebf7ff]",
    description: "text-sm text-[#004066]/70 dark:text-[#ebf7ff]/70 leading-relaxed",
  },
  suggestion: {
    grid: "grid grid-cols-1 gap-2 w-full max-w-[320px] pt-4",
    button: "group flex items-center justify-between p-3 rounded-xl border border-[#004066]/15 dark:border-[#004066]/40 bg-white dark:bg-[#061a29] hover:border-[#0077be] hover:bg-[#0077be]/5 transition-all text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer",
    label: "text-sm font-medium text-[#004066] dark:text-[#ebf7ff] group-hover:text-[#0077be] dark:group-hover:text-[#38bdf8] transition-colors",
    icon: "text-[#004066]/40 dark:text-[#ebf7ff]/40 group-hover:text-[#0077be] transition-colors",
  }
};

/**
 * AI Chat Message Styles
 */
export const aiChatMessageStyles = {
  wrapper: (role: "user" | "assistant" | "system") =>
    cn(
      "flex gap-3 w-full",
      role === "user"
        ? "flex-row-reverse"
        : role === "system"
          ? "justify-center"
          : "justify-start",
    ),
  avatar: (role: "user" | "assistant" | "system") =>
    cn(
      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-105",
      role === "assistant"
        ? "bg-[#0077be] text-white"
        : "bg-[#004066] text-[#ebf7ff] border border-[#004066]/30",
      role === "system" && "hidden",
    ),
  bubble: (role: "user" | "assistant" | "system") =>
    cn(
      "max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed relative",
      role === "assistant"
        ? "bg-white dark:bg-[#061a29] text-[#004066] dark:text-[#ebf7ff] rounded-tl-none border border-[#004066]/15 dark:border-[#004066]/40 shadow-sm"
        : role === "user"
          ? "bg-[#0077be] text-white rounded-tr-none shadow-md shadow-[#0077be]/20"
          : "bg-[#004066]/10 dark:bg-[#004066]/30 text-[#004066] dark:text-[#ebf7ff] text-[11px] font-medium px-4 py-1.5 rounded-full border border-[#004066]/15 backdrop-blur-sm",
    ),
  typingIndicator: "bg-white dark:bg-[#061a29] p-4 rounded-2xl rounded-tl-none flex gap-1.5 border border-[#004066]/15 dark:border-[#004066]/40 w-fit shadow-sm",
  attachment: {
    container: "flex flex-wrap gap-2 mt-2",
    root: "group relative flex items-center gap-3 p-2 bg-white dark:bg-[#061a29] border border-[#004066]/15 dark:border-[#004066]/40 rounded-xl hover:border-[#0077be] transition-all shadow-sm hover:shadow-md",
    preview: "relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#ebf7ff] dark:bg-[#041829] border border-[#004066]/15",
    icon: "h-10 w-10 rounded-lg bg-[#0077be]/10 text-[#0077be] flex items-center justify-center flex-shrink-0",
    info: "flex-1 min-w-0",
    name: "text-xs font-medium text-[#004066] dark:text-[#ebf7ff] truncate",
    size: "text-[10px] text-[#004066]/60 dark:text-[#ebf7ff]/60 font-medium",
    actions: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
    actionButton: "p-1.5 hover:bg-[#ebf7ff] dark:hover:bg-[#004066]/40 rounded-lg text-[#004066]/60 dark:text-[#ebf7ff]/60 hover:text-[#0077be] transition-colors",
    removeButton: "p-1.5 hover:bg-rose-50 rounded-lg text-[#004066]/60 hover:text-rose-500 transition-colors",
  },
  markdown: {
    root: "prose prose-sm max-w-none text-[#004066] dark:text-[#ebf7ff]",
    code: "bg-[#ebf7ff] dark:bg-[#041829] px-1.5 py-0.5 rounded text-[12px] font-mono border border-[#004066]/15 text-[#0077be] dark:text-[#38bdf8]",
    paragraph: "mb-2 last:mb-0 leading-relaxed",
    list: "list-disc ml-4 mb-2 space-y-1",
    orderedList: "list-decimal ml-4 mb-2 space-y-1",
    listItem: "mb-1",
    heading: "font-bold text-[#004066] dark:text-[#ebf7ff] mb-2 mt-4 first:mt-0",
  }
};

/**
 * AI Chat Input Styles
 */
export const aiChatInputStyles = {
  root: "p-4 border-t border-[#004066]/15 dark:border-[#004066]/40 bg-[#ebf7ff] dark:bg-[#03131e] shrink-0",
  inner: "relative flex flex-col gap-2",
  attachmentPreview: "flex flex-wrap gap-2 mb-2 p-2 bg-[#ebf7ff]/40 dark:bg-[#041829]/60 rounded-xl border border-dashed border-[#004066]/20",
  textarea: "w-full bg-white dark:bg-[#061a29] border border-[#004066]/20 dark:border-[#004066]/40 rounded-2xl pl-4 py-3.5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077be]/20 focus:border-[#0077be] text-[#004066] dark:text-[#ebf7ff] placeholder:text-[#004066]/40 transition-all resize-none min-h-[52px] max-h-[200px] scrollbar-hide",
  actionGroup: "absolute right-2 bottom-2 flex items-center justify-center z-10",
  sendButton: "w-9 h-9 bg-[#0077be] text-white rounded-xl hover:bg-[#00639e] transition-all disabled:opacity-40 disabled:hover:bg-[#0077be] shadow-md shadow-[#0077be]/20 flex items-center justify-center active:scale-95 cursor-pointer disabled:cursor-not-allowed",
  attachButton: "p-2 text-[#004066]/60 dark:text-[#ebf7ff]/60 hover:text-[#0077be] hover:bg-[#0077be]/10 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer",
  stopButton: "w-9 h-9 text-rose-500 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition-all active:scale-95 flex items-center justify-center cursor-pointer",
};
