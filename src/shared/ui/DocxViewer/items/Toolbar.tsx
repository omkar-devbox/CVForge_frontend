import React, { useState, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  FileText,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Braces,
} from "lucide-react";

interface ToolbarProps {
  fileName?: string;
  showFileName?: boolean;
  currentPage: number;
  totalPages: number;
  zoom: number;
  isFullScreen: boolean;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitWidth: () => void;
  onToggleFullScreen: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onFileSelect?: (file: File) => void;
  /** Called when user clicks the Export JSON button. If undefined, button is hidden. */
  onJsonExport?: () => void;
  /** When true AND onJsonExport is provided, the Export JSON button is visible. */
  showJsonExportBtn?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  fileName = "Document.docx",
  showFileName = true,
  currentPage,
  totalPages,
  zoom,
  isFullScreen,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitWidth,
  onToggleFullScreen,
  onPrint,
  onDownload,
  onJsonExport,
  showJsonExportBtn = false,
}) => {
  const [pageInput, setPageInput] = useState<string>(String(currentPage));

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handlePageInputSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const p = parseInt(pageInput.trim(), 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
    } else {
      setPageInput(String(currentPage));
    }
  };

  return (
    <div className="docx-toolbar w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs z-30 select-none">
      {/* Left: Document Name */}
      {showFileName && fileName ? (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50">
            <FileText className="w-4 h-4" />
          </div>
          <span
            className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs"
            title={fileName}
          >
            {fileName}
          </span>
        </div>
      ) : (
        <div className="min-w-0" />
      )}

      {/* Center: Page Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-200/60 dark:border-slate-700/60">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Previous Page"
          className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <form onSubmit={handlePageInputSubmit} className="flex items-center px-1">
          <input
            type="text"
            inputMode="numeric"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={() => handlePageInputSubmit()}
            className="w-8 text-center text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
            title="Type page number and press Enter"
          />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1.5 mr-1 select-none">
            / {Math.max(1, totalPages)}
          </span>
        </form>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="Next Page"
          className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Zoom & Action Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom Out (-)"
            className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onZoomReset}
            title="Click to Reset Zoom (100%)"
            className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 px-1.5 min-w-[42px] text-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom In (+)"
            className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fit Width */}
        <button
          type="button"
          onClick={onFitWidth}
          title="Fit to Width"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Maximize className="w-4 h-4" />
        </button>

        {/* Reset Zoom Button */}
        <button
          type="button"
          onClick={onZoomReset}
          title="Reset Zoom"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />



        {/* Export JSON */}
        {onJsonExport && showJsonExportBtn && (
          <button
            type="button"
            onClick={onJsonExport}
            title="Export as JSON (docx-bridge format)"
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
          >
            <Braces className="w-4 h-4" />
          </button>
        )}

        {/* Download */}
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            title="Download Document"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Fullscreen */}
        <button
          type="button"
          onClick={onToggleFullScreen}
          title={isFullScreen ? "Exit Fullscreen" : "Fullscreen View"}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isFullScreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
