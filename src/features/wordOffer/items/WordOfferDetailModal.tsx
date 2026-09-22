import React, { useState, useRef } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  CheckCircle,
  Download,
  Sparkles,
} from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { apiClient } from "@/app/api/client/api-client";
import { wordOfferApi } from "../api/wordOfferApi";
import type { WordOfferRecord } from "../types/wordOffer.types";

interface WordOfferDetailModalProps {
  offer: WordOfferRecord | null;
  onClose: () => void;
  onExportDocx?: (offer: WordOfferRecord) => void;
}

export const WordOfferDetailModal: React.FC<WordOfferDetailModalProps> = ({
  offer,
  onClose,
  onExportDocx,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFileName, setProcessedFileName] = useState<string | null>(null);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [extractedFields, setExtractedFields] = useState<Record<string, any>>({});
  const [replacedCount, setReplacedCount] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!offer) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const validExtensions = [".docx", ".doc", ".pdf", ".txt"];
    const isValid = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isValid) {
      toast.error("Please upload a .docx, .doc, .pdf, or .txt document.");
      return;
    }

    setSelectedFile(file);
    setProcessedFileUrl(null);
    setProcessedFileName(null);
    setExtractedFields({});
    setReplacedCount(0);
  };

  const handleProcess = async () => {
    if (!selectedFile && !prompt.trim()) {
      toast.error("Please upload a file or enter basic instructions / prompt.");
      return;
    }

    setIsProcessing(true);

    try {
      // If no file was selected, create a prompt instruction file
      const fileToUpload = selectedFile || new File(
        [prompt],
        `instructions_${offer.offerNumber}.txt`,
        { type: "text/plain" }
      );

      const targetTemplateId = offer.templateId || offer.id;
      toast.info("Extracting document and analyzing with LLM against Master Template...");

      const res = await wordOfferApi.processDocument(
        fileToUpload,
        String(targetTemplateId),
        offer.id,
        prompt
      );

      setProcessedFileName(res.fileName);
      setProcessedFileUrl(res.downloadUrl);
      setExtractedFields(res.extractedFields || {});
      setReplacedCount(res.replacedFieldsCount || 0);

      toast.success(
        res.message ||
        `Document processed! Replaced ${res.replacedFieldsCount} fields without style changes.`
      );
    } catch (err: any) {
      toast.error(`Processing failed: ${err?.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedFileUrl && processedFileName) {
      const rawBase = import.meta.env?.VITE_API_URL || "http://localhost:8000";
      // Ensure we do not duplicate /api/v1 if downloadUrl already starts with /api/v1
      const hostOrigin = rawBase.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
      const fullUrl = processedFileUrl.startsWith("http")
        ? processedFileUrl
        : `${hostOrigin}${processedFileUrl.startsWith("/") ? "" : "/"}${processedFileUrl}`;

      const a = document.createElement("a");
      a.href = fullUrl;
      a.download = processedFileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloaded: ${processedFileName}`);
    } else if (onExportDocx) {
      onExportDocx(offer);
    }
  };

  const handleModalClose = () => {
    if (isProcessing) return;
    setSelectedFile(null);
    setPrompt("");
    setProcessedFileUrl(null);
    setProcessedFileName(null);
    onClose();
  };

  const dynamicFieldsList = offer.dynamicFields || [];

  return (
    <Modal open={Boolean(offer)} onClose={handleModalClose} size="xl">
      <ModalHeader
        title={`AI Offer Assistant: ${offer.offerNumber || offer.title}`}
        description={`${offer.templateName || offer.title} • LLM Analysis & Style-Preserved Document Generation`}
        onClose={handleModalClose}
      />

      <ModalBody className="space-y-5 py-5">
        {/* Section 1: Associated Template Dynamic Fields or AI Understanding Tip */}
        {dynamicFieldsList.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Template Dynamic Fields ({dynamicFieldsList.length})
              </label>
              <span className="text-[11px] text-slate-400">
                Click a tag to insert into instructions
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
              {dynamicFieldsList.map((df) => (
                <button
                  key={df.id}
                  type="button"
                  onClick={() => setPrompt((prev) => `${prev} ${df.key || `{{${df.name}}}`}`.trim())}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                  title={`Click to add ${df.key} to prompt`}
                >
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {df.key || `{{${df.name}}}`}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">
                    ({df.type || "text"})
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <Sparkles size={16} className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-semibold">Smart AI Document Understanding</p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                AI will intelligently identify and update quotation fields (e.g. Quotation No, Date, Kind Attn, Project, Client, Pricing) from your prompt or uploaded inquiry while preserving 100% of formatting.
              </p>
            </div>
          </div>
        )}

        {/* Section 2: Document Upload */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Upload Document / RFQ / Spec Sheet
            </label>
            <span className="text-[11px] text-slate-400">
              Optional (.docx, .doc, .pdf, .txt)
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc,.pdf,.txt"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />

          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileChange(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                  : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2.5">
                <UploadCloud size={20} />
              </div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Click to upload inquiry or drag & drop document
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Word (.docx, .doc), PDF, or Text (up to 25MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatFileSize(selectedFile.size)} • Ready for AI extraction
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setProcessedFileUrl(null);
                  setProcessedFileName(null);
                }}
                className="text-slate-400 hover:text-red-500 p-1.5 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Instructions / Basic Prompt */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            Instructions / Prompt / Changes
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Update Quotation No to Q-2026-099, Kind Attn to Mr. Rajesh Patel, Date to 22.09.2026, Project to Battery Conveyor Line..."
            rows={3}
            className="w-full text-xs p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Type instructions or specific values to replace in the quotation template.
          </p>
        </div>

        {/* Extracted & Replaced Values Card */}
        {Object.keys(extractedFields).length > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-600" />
                AI Extracted & Replaced Fields ({replacedCount} modifications)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pt-1">
              {Object.entries(extractedFields)
                .filter(([k]) => !k.startsWith("{{") && !k.endsWith("}}"))
                .map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
                  >
                    <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize truncate max-w-[45%]">
                      {k.replace(/_/g, " ")}:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[50%] text-right font-medium">
                      {String(v)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Processed Result Banner */}
        {processedFileName && processedFileUrl && (
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {processedFileName}
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                  {replacedCount > 0
                    ? `Successfully updated ${replacedCount} fields with 100% style preservation`
                    : "Document generated and ready"}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              className="gap-1.5 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            >
              <Download size={14} />
              Download
            </Button>
          </div>
        )}
      </ModalBody>

      <ModalFooter align="right">
        <Button variant="outline" onClick={handleModalClose} disabled={isProcessing}>
          Close
        </Button>

        <Button
          variant="primary"
          onClick={handleProcess}
          disabled={isProcessing || (!selectedFile && !prompt.trim())}
          className="gap-2 min-w-[140px]"
        >
          {isProcessing ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Processing with AI...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Generate with AI</span>
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

