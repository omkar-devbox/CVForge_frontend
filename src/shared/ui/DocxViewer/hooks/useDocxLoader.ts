import { useState, useEffect, useCallback } from "react";
import type { DocxBridgeDocument } from "../types";
import { parseDocxBridgeFile } from "../parser/docxBridgeParser";
import { downloadDocxBridgeJson } from "../parser/docxToJson";

export interface UseDocxLoaderParams {
  fileUrl?: string;
  fileBlob?: Blob | File | ArrayBuffer | null;
  data?: DocxBridgeDocument | null;
  fileName?: string;
  onLoad?: (doc: DocxBridgeDocument) => void;
  onError?: (error: Error) => void;
  onJsonExport?: (doc: DocxBridgeDocument) => void;
  showJsonExport?: boolean;
}

export function useDocxLoader({
  fileUrl,
  fileBlob,
  data,
  fileName = "Document.docx",
  onLoad,
  onError,
  onJsonExport,
  showJsonExport = false,
}: UseDocxLoaderParams) {
  const [documentData, setDocumentData] = useState<DocxBridgeDocument | null>(
    data || null
  );
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<string | null>(null);

  // Load document from data, blob, or url
  const loadDocument = useCallback(async () => {
    // If pre-parsed data is provided, use directly
    if (data) {
      setDocumentData(data);
      setLoading(false);
      setError(null);
      onLoad?.(data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let doc: DocxBridgeDocument;

      if (fileBlob) {
        doc = await parseDocxBridgeFile(fileBlob);
      } else if (fileUrl) {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(
            `Failed to load document (${response.status}: ${response.statusText})`
          );
        }
        const buffer = await response.arrayBuffer();
        doc = await parseDocxBridgeFile(buffer);
      } else {
        setLoading(false);
        return;
      }

      setDocumentData(doc);
      onLoad?.(doc);
      onJsonExport?.(doc);
    } catch (err: any) {
      console.error("DocxViewer failed to load document:", err);
      const errMsg = err?.message || "Failed to load and parse document";
      setError(errMsg);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [fileUrl, fileBlob, data, onLoad, onError, onJsonExport]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Handle local file selection
  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const doc = await parseDocxBridgeFile(buffer);
      setDocumentData(doc);
      onLoad?.(doc);
      onJsonExport?.(doc);
    } catch (err: any) {
      console.error("Failed to parse selected file:", err);
      setError(err?.message || "Failed to parse selected document");
    } finally {
      setLoading(false);
    }
  };

  // Handle JSON export / download
  const handleJsonExport = () => {
    if (!documentData) return;
    if (onJsonExport) {
      onJsonExport(documentData);
    }
    if (showJsonExport || !onJsonExport) {
      const baseName = fileName.replace(/\.(docx|json)$/i, "");
      downloadDocxBridgeJson(documentData, `${baseName}.json`);
    }
  };

  return {
    documentData,
    setDocumentData,
    loading,
    error,
    loadDocument,
    handleFileSelect,
    handleJsonExport,
  };
}
