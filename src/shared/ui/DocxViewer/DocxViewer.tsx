import React, { useState, useEffect, useRef, useCallback } from "react";
import type {
  DocxViewerProps,
  DocxBridgeDocument,
  PaginatedPage,
} from "./types/docxBridge.types";
import { DocumentProvider } from "./context/DocumentContext";
import { parseDocxBridgeFile } from "./parser/docxBridgeParser";
import { downloadDocxBridgeJson } from "./parser/docxToJson";
import { Section } from "./items/Section";
import { Toolbar } from "./items/Toolbar";
import { DocxPageMeasurer, type MeasuredData } from "./items/DocxPageMeasurer";
import { buildPaginatedPages } from "./utils/docxPaginator";
import { AlertCircle, RefreshCw, Loader2, FileQuestion } from "lucide-react";

export const DocxViewer: React.FC<DocxViewerProps> = ({
  fileUrl,
  fileBlob,
  data,
  fileName = "Document.docx",
  showToolbar = true,
  className = "",
  onLoad,
  onError,
  onJsonExport,
  showJsonExport = false,
  showPageNumberPill = false,
}) => {
  const [documentData, setDocumentData] = useState<DocxBridgeDocument | null>(
    data || null
  );
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<string | null>(null);

  // Exact paginated pages
  const [paginatedPages, setPaginatedPages] = useState<PaginatedPage[]>([]);

  // Viewer state
  const [zoom, setZoom] = useState<number>(1.0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Initial instant heuristic pagination when documentData changes
  useEffect(() => {
    if (!documentData || !documentData.sections || documentData.sections.length === 0) {
      setPaginatedPages([]);
      return;
    }
    const initial = buildPaginatedPages(
      documentData.sections,
      documentData.headers,
      documentData.footers
    );
    setPaginatedPages(initial);
  }, [documentData]);

  // Callback when DOM measurer finishes reading real pixel heights
  const handleMeasured = useCallback(
    (measuredData: MeasuredData) => {
      if (!documentData?.sections || documentData.sections.length === 0) return;
      const exact = buildPaginatedPages(
        documentData.sections,
        documentData.headers,
        documentData.footers,
        measuredData
      );
      setPaginatedPages(exact);
    },
    [documentData]
  );

  // Total pages
  const totalPages = Math.max(1, paginatedPages.length);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(2.0, Math.round((prev + 0.1) * 10) / 10));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10));
  const handleZoomReset = () => setZoom(1.0);

  const handleFitWidth = () => {
    if (!scrollContainerRef.current) return;
    const containerWidth = scrollContainerRef.current.clientWidth - 64;
    const firstPageWidth = paginatedPages[0]?.pageWidthPx || 794;
    const fitZoom = Math.max(0.5, Math.min(1.8, containerWidth / firstPageWidth));
    setZoom(Math.round(fitZoom * 100) / 100);
  };

  // Fullscreen toggle
  const handleToggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullScreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => { });
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Print document
  const handlePrint = () => {
    window.print();
  };

  // Download document
  const handleDownload = () => {
    if (fileUrl) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName;
      a.click();
    } else if (fileBlob) {
      const blob = fileBlob instanceof Blob ? fileBlob : new Blob([fileBlob]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

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

  // Page navigation
  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    const pageEl = scrollContainerRef.current?.querySelector(
      `[data-page="${validPage}"]`
    );
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Track scroll position to update current page indicator
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const pageElements = scrollContainerRef.current.querySelectorAll("[data-page]");
    const containerTop = scrollContainerRef.current.scrollTop;
    const containerHeight = scrollContainerRef.current.clientHeight;
    const targetY = containerTop + containerHeight * 0.35;

    for (let i = 0; i < pageElements.length; i++) {
      const el = pageElements[i] as HTMLElement;
      if (el.offsetTop + el.offsetHeight > targetY) {
        const pageNum = parseInt(el.getAttribute("data-page") || "1", 10);
        setCurrentPage(pageNum);
        break;
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`docx-viewer-root flex flex-col w-full h-full bg-[#eef2f6] dark:bg-[#0f1117] overflow-hidden select-text relative ${className}`}
    >
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background: white !important;
          }
          .docx-toolbar, .print\\:hidden, .docx-measure-sandbox {
            display: none !important;
          }
          .docx-viewer-root {
            background: white !important;
            overflow: visible !important;
            height: auto !important;
          }
          .docx-zoom-container {
            transform: none !important;
            margin-bottom: 0 !important;
          }
          .docx-page-container {
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .docx-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>

      {/* Top Toolbar */}
      {showToolbar && (
        <Toolbar
          fileName={fileName}
          currentPage={currentPage}
          totalPages={totalPages}
          zoom={zoom}
          isFullScreen={isFullScreen}
          onPageChange={handlePageChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onFitWidth={handleFitWidth}
          onToggleFullScreen={handleToggleFullScreen}
          onPrint={handlePrint}
          onDownload={fileUrl || fileBlob ? handleDownload : undefined}
          onFileSelect={handleFileSelect}
          onJsonExport={documentData ? handleJsonExport : undefined}
          showJsonExportBtn={!!(onJsonExport || showJsonExport)}
        />
      )}

      {/* Main Document Content Canvas */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 w-full overflow-auto flex flex-col items-center p-6 relative focus:outline-hidden"
        tabIndex={0}
      >
        {/* Loading Spinner */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium">Parsing and rendering document...</span>
          </div>
        )}

        {/* Error Display */}
        {!loading && error && (
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
              onClick={loadDocument}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && (!documentData || (documentData.sections || []).length === 0) && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-2 my-auto">
            <FileQuestion className="w-8 h-8 opacity-60" />
            <span className="text-sm font-medium">No document content to display</span>
          </div>
        )}

        {/* Document Pages with Zoom Transform */}
        {!loading && !error && documentData && paginatedPages.length > 0 && (
          <DocumentProvider document={documentData}>
            <div
              className="docx-zoom-container origin-top transition-transform duration-100 ease-out flex flex-col items-center w-full"
              style={{
                transform: `scale(${zoom})`,
                marginBottom: zoom > 1.0 ? `${(zoom - 1.0) * 800}px` : "0px",
              }}
            >
              {paginatedPages.map((page) => (
                <Section
                  key={`page-${page.pageNumber}`}
                  page={page}
                  pageNumber={page.pageNumber}
                  totalPages={totalPages}
                  showPageNumberPill={showPageNumberPill}
                />
              ))}
            </div>
          </DocumentProvider>
        )}

        {/* Hidden measurement sandbox pass */}
        {!loading && !error && documentData && (documentData.sections || []).length > 0 && (
          <DocumentProvider document={documentData}>
            <DocxPageMeasurer
              document={documentData}
              onMeasured={handleMeasured}
            />
          </DocumentProvider>
        )}
      </div>
    </div>
  );
};

export default DocxViewer;
