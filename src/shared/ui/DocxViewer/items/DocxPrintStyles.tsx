import React from "react";

export const DocxPrintStyles: React.FC = () => (
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
);
