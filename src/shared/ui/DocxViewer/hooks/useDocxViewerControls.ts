import { useState, useEffect } from "react";

export interface UseDocxViewerControlsParams {
  totalPages: number;
  firstPageWidth?: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  fileUrl?: string;
  fileBlob?: Blob | File | ArrayBuffer | null;
  fileName?: string;
}

export function useDocxViewerControls({
  totalPages,
  firstPageWidth = 794,
  containerRef,
  scrollContainerRef,
  fileUrl,
  fileBlob,
  fileName = "Document.docx",
}: UseDocxViewerControlsParams) {
  const [zoom, setZoom] = useState<number>(1.0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Zoom handlers
  const handleZoomIn = () =>
    setZoom((prev) => Math.min(2.0, Math.round((prev + 0.1) * 10) / 10));
  const handleZoomOut = () =>
    setZoom((prev) => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10));
  const handleZoomReset = () => setZoom(1.0);

  const handleFitWidth = () => {
    if (!scrollContainerRef.current) return;
    const containerWidth = scrollContainerRef.current.clientWidth - 64;
    const fitZoom = Math.max(0.5, Math.min(1.8, containerWidth / firstPageWidth));
    setZoom(Math.round(fitZoom * 100) / 100);
  };

  // Fullscreen toggle
  const handleToggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullScreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => {});
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

  return {
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
  };
}
