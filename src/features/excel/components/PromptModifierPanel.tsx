import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Download,
  Send,
  Loader2,
  CheckCircle2,
  FileSpreadsheet,
  Terminal,
  AlertCircle,
  Lightbulb,
  Cpu,
  RefreshCw,
  Radio,
} from "lucide-react";
import {
  modifyExcelWithPrompt,
  fetchModelStatus,
  PromptModificationResult,
  ModelStatusInfo,
} from "../api";

interface PromptModifierPanelProps {
  selectedFile: File | null;
  onModificationSuccess?: (result: PromptModificationResult) => void;
}

export const PromptModifierPanel: React.FC<PromptModifierPanelProps> = ({
  selectedFile,
  onModificationSuccess,
}) => {
  const [promptText, setPromptText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PromptModificationResult | null>(
    null
  );

  const [modelStatus, setModelStatus] = useState<ModelStatusInfo | null>(null);
  const [isCheckingModel, setIsCheckingModel] = useState<boolean>(false);

  const loadModelStatus = async () => {
    setIsCheckingModel(true);
    try {
      const status = await fetchModelStatus();
      setModelStatus(status);
    } catch {
      setModelStatus(null);
    } finally {
      setIsCheckingModel(false);
    }
  };

  useEffect(() => {
    loadModelStatus();
  }, []);

  const samplePrompts = [
    "Highlight all values greater than 500 in light green and values less than 100 in light red.",
    "Add a bold Total summary row at the bottom with SUM formulas for all numeric columns.",
    "Sort rows by Column B in ascending order and format header row with a navy background.",
    "Capitalize all text in column headers and auto-adjust column width.",
  ];

  const handleSubmitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await modifyExcelWithPrompt(promptText, selectedFile);
      setLastResult(result);
      if (onModificationSuccess) {
        onModificationSuccess(result);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "An unexpected error occurred while modifying the Excel file."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!lastResult) return;
    const url = window.URL.createObjectURL(lastResult.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = lastResult.modifiedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-[#004066]/15 dark:border-[#004066]/40 bg-white dark:bg-[#061a29] shadow-sm p-6 flex flex-col gap-6">
      {/* Header with AI Model Connection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0077be] to-[#004066] text-white flex items-center justify-center shadow-md shadow-[#0077be]/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#004066] dark:text-[#ebf7ff] flex items-center gap-2">
              AI Natural Language Excel Modifier
            </h3>
            <p className="text-xs text-[#004066]/70 dark:text-[#ebf7ff]/70">
              {selectedFile
                ? `Modifying target: ${selectedFile.name}`
                : "No file uploaded. Prompt will generate a fresh modified Excel spreadsheet."}
            </p>
          </div>
        </div>

        {/* Model Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ebf7ff] dark:bg-[#041829] border border-[#004066]/15 dark:border-[#004066]/40 text-xs">
            <div className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  modelStatus?.connected ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  modelStatus?.connected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#004066] dark:text-[#ebf7ff] flex items-center gap-1 text-[11px]">
                <Cpu className="h-3.5 w-3.5 text-[#0077be]" />
                {modelStatus?.connected ? "Model Connected" : "AI Engine Active"}
              </span>
              <span className="text-[10px] text-[#004066]/70 dark:text-[#ebf7ff]/70 truncate max-w-[200px]">
                {modelStatus?.mode || "Checking connection..."}
              </span>
            </div>
          </div>

          <button
            onClick={loadModelStatus}
            disabled={isCheckingModel}
            title="Check Model Connection Status"
            className="p-2 rounded-xl bg-[#ebf7ff] dark:bg-[#041829] text-[#004066]/70 dark:text-[#ebf7ff]/70 hover:bg-[#0077be]/10 dark:hover:bg-[#0077be]/20 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCheckingModel ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Preset Suggestion Chips */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#004066]/70 dark:text-[#ebf7ff]/70 mb-2">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          Sample Prompt Instructions:
        </div>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPromptText(sample)}
              className="text-left text-xs px-3 py-1.5 rounded-xl bg-[#ebf7ff]/70 dark:bg-[#041829]/70 text-[#004066] dark:text-[#ebf7ff] hover:bg-[#0077be]/10 hover:text-[#0077be] dark:hover:bg-[#0077be]/20 dark:hover:text-[#38bdf8] border border-[#004066]/10 dark:border-[#004066]/30 transition-all cursor-pointer"
            >
              "{sample}"
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Submission Form */}
      <form onSubmit={handleSubmitPrompt} className="flex flex-col gap-3">
        <div className="relative">
          <textarea
            rows={3}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Describe what changes, calculations, formatting, or row operations you want to perform..."
            disabled={isProcessing}
            className="w-full p-4 rounded-xl text-sm bg-[#ebf7ff]/30 dark:bg-[#03131e] border border-[#004066]/20 dark:border-[#004066]/40 focus:outline-none focus:ring-2 focus:ring-[#0077be] text-[#004066] dark:text-[#ebf7ff] resize-none placeholder:text-[#004066]/40"
          />

          <div className="absolute right-3 bottom-3">
            <button
              type="submit"
              disabled={isProcessing || !promptText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0077be] hover:bg-[#00639e] disabled:opacity-50 shadow-md shadow-[#0077be]/20 transition-all active:scale-95 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Execute Prompt
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error Display */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Output Execution Logs & Download Button */}
      {lastResult && (
        <div className="p-4 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Modification Complete
            </div>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              Download {lastResult.modifiedFilename}
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-2 border-b border-slate-800 pb-1">
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              Execution Logs:
            </div>
            <ul className="space-y-1 text-xs font-mono text-slate-300">
              {lastResult.actionLogs.map((log, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 select-none">&gt;</span>
                  <span>{log}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
