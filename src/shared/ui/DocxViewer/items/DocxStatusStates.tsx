import React from "react";
import { AlertCircle, RefreshCw, Loader2, FileQuestion } from "lucide-react";

export const DocxLoadingState: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
    <span className="text-sm font-medium">Parsing and rendering document...</span>
  </div>
);

export interface DocxErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const DocxErrorState: React.FC<DocxErrorStateProps> = ({ error, onRetry }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md my-auto">
    <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mb-3">
      <AlertCircle className="w-7 h-7" />
    </div>
    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
      Unable to Display Document
    </h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{error}</p>
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
    >
      <RefreshCw className="w-3.5 h-3.5" />
      Try Again
    </button>
  </div>
);

export const DocxEmptyState: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-2 my-auto">
    <FileQuestion className="w-8 h-8 opacity-60" />
    <span className="text-sm font-medium">No document content to display</span>
  </div>
);
