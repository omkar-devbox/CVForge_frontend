import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, FileCheck, AlertCircle } from "lucide-react";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  isLoading?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  selectedFile,
  onClearFile,
  isLoading = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = [".xlsx", ".xlsm", ".xltx", ".xltm", ".xls", ".csv"];

  const validateAndPassFile = (file: File) => {
    setErrorMsg(null);
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setErrorMsg(
        `Unsupported file type '${ext}'. Please upload an Excel (.xlsx, .xlsm, .xls) or CSV file.`
      );
      return;
    }
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xlsm,.xltx,.xltm,.xls,.csv"
        className="hidden"
      />

      {selectedFile ? (
        <div className="relative group overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 p-5 transition-all duration-200 shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <FileCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-base">
                    {selectedFile.name}
                  </h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Size: {formatFileSize(selectedFile.size)} • Type:{" "}
                  {selectedFile.name.split(".").pop()?.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 hover:bg-emerald-200/80 dark:hover:bg-emerald-800/50 rounded-lg transition-colors"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={onClearFile}
                disabled={isLoading}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                title="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
            isDragging
              ? "border-[#0077be] bg-[#0077be]/10 scale-[0.99]"
              : "border-[#004066]/20 dark:border-[#004066]/40 bg-white/80 dark:bg-[#061a29]/80 hover:border-[#0077be] dark:hover:border-[#0077be] hover:bg-[#ebf7ff]/70 dark:hover:bg-[#004066]/20 shadow-sm hover:shadow"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-[#0077be]/10 dark:bg-[#0077be]/20 border border-[#0077be]/20 flex items-center justify-center text-[#0077be] dark:text-[#38bdf8] group-hover:scale-110 transition-transform">
              <Upload className="h-7 w-7" />
            </div>

            <div>
              <p className="text-base font-bold text-[#004066] dark:text-[#ebf7ff]">
                Drag & drop your Excel or CSV spreadsheet here
              </p>
              <p className="text-xs text-[#004066]/70 dark:text-[#ebf7ff]/70 mt-1">
                Supports <span className="font-semibold text-[#004066] dark:text-[#ebf7ff]">.xlsx, .xlsm, .csv, .xls</span> up to 50MB
              </p>
            </div>

            <button
              type="button"
              className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl text-white bg-[#0077be] hover:bg-[#00639e] shadow-sm shadow-[#0077be]/25 transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Browse Spreadsheet
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3 rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
