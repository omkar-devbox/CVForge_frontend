import React, { useState, useEffect, useRef, useCallback } from "react";
import type { DocxViewerProps, PaginatedPage } from "./types";
import { DocumentProvider } from "./context/DocumentContext";
import { Section } from "./items/Section";
import { Toolbar } from "./items/Toolbar";
import { DocxPageMeasurer, type MeasuredData } from "./items/DocxPageMeasurer";
import { DocxPrintStyles } from "./items/DocxPrintStyles";
import {
  DocxLoadingState,
  DocxErrorState,
  DocxEmptyState,
} from "./items/DocxStatusStates";
import { buildPaginatedPages } from "./utils/docxPaginator";
import { useDocxLoader } from "./hooks/useDocxLoader";
import { useDocxViewerControls } from "./hooks/useDocxViewerControls";

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
  showWatermark = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Document loading & file handling
  const {
    documentData,
    loading,
    error,
    loadDocument,
    handleFileSelect,
    handleJsonExport,
  } = useDocxLoader({
    fileUrl,
    fileBlob,
    data,
    fileName,
    onLoad,
    onError,
    onJsonExport,
    showJsonExport,
  });

  // Paginated pages state
  const [paginatedPages, setPaginatedPages] = useState<PaginatedPage[]>([]);

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

  const totalPages = Math.max(1, paginatedPages.length);
  const firstPageWidth = paginatedPages[0]?.pageWidthPx || 794;

  // Zoom, navigation, fullscreen, scroll tracking
  const {
    zoom,
    currentPage,
    isFullScreen,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleFitWidth,
    handleToggleFullScreen,
    handlePrint,
    handleDownload,
    handlePageChange,
    handleScroll,
  } = useDocxViewerControls({
    totalPages,
    firstPageWidth,
    containerRef,
    scrollContainerRef,
    fileUrl,
    fileBlob,
    fileName,
  });

  return (
    <div
      ref={containerRef}
      className={`docx-viewer-root flex flex-col w-full h-full bg-[#eef2f6] dark:bg-[#0f1117] overflow-hidden select-text relative ${className}`}
    >
      <DocxPrintStyles />

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
        {loading && <DocxLoadingState />}

        {/* Error Display */}
        {!loading && error && <DocxErrorState error={error} onRetry={loadDocument} />}

        {/* Empty State */}
        {!loading && !error && (!documentData || (documentData.sections || []).length === 0) && (
          <DocxEmptyState />
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
                  showWatermark={showWatermark}
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
