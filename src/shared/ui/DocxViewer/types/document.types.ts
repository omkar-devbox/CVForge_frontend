import type { DocxBorder, DocxPageBorders } from "./border.types";
import type {
  DocxContentItem,
  DocxHeaderFooter,
  DocxSectionHeaders,
  DocxSectionFooters,
} from "./headerFooter.types";
import type {
  DocxStyle,
  DocxNumberingData,
  DocxRelation,
} from "./style.types";

export interface DocxPageMargins {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  header?: number;
  footer?: number;
  gutter?: number;
}

export interface DocxPageSize {
  width?: number;
  height?: number;
}

export interface DocxPage {
  size?: string | DocxPageSize;
  orientation?: "portrait" | "landscape";
  margins?: DocxPageMargins;
}

export interface DocxColumns {
  space?: number;
  num?: number;
  equalWidth?: number | boolean;
  columns?: Array<{ w?: number; space?: number }>;
}

export interface DocxSection {
  page?: DocxPage & { borders?: DocxPageBorders };
  columns?: DocxColumns;
  content?: DocxContentItem[];
  headers?: DocxSectionHeaders | DocxHeaderFooter[] | Record<string, DocxHeaderFooter>;
  footers?: DocxSectionFooters | DocxHeaderFooter[] | Record<string, DocxHeaderFooter>;
  header?: DocxHeaderFooter;
  footer?: DocxHeaderFooter;
  titlePg?: boolean;
  evenAndOddHeaders?: boolean;
  pageBorders?: DocxPageBorders;
  background?: string;
  borders?: Record<string, DocxBorder | string> | DocxPageBorders;
}

export interface PaginatedPage {
  pageNumber: number;
  totalPages: number;
  sectionIndex: number;
  section: DocxSection;
  pageWidthPx: number;
  pageHeightPx: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    header: number;
    footer: number;
  };
  pageBorders?: DocxPageBorders;
  header?: DocxHeaderFooter;
  footer?: DocxHeaderFooter;
  items: DocxContentItem[];
}

export interface DocxBridgeDocument {
  sections?: DocxSection[];
  styles?: Record<string, DocxStyle> | DocxStyle[];
  numbering?: DocxNumberingData | any[];
  headers?: Record<string, DocxHeaderFooter> | DocxHeaderFooter[];
  footers?: Record<string, DocxHeaderFooter> | DocxHeaderFooter[];
  media?: Record<string, string>; // Maps rId or target path to base64 Data URL or media URL
  relations?: DocxRelation[] | Record<string, string>;
  relationships?: DocxRelation[] | Record<string, string>;
  background?: string;
  metadata?: {
    title?: string;
    creator?: string;
    description?: string;
    created?: string;
    modified?: string;
    revision?: string | number;
    [key: string]: any;
  };
}

export interface DocxViewerProps {
  /** URL to .docx or .json file */
  fileUrl?: string;
  /** Blob, File or ArrayBuffer of .docx or .json */
  fileBlob?: Blob | File | ArrayBuffer | null;
  /** Pre-parsed docx-bridge JSON document object */
  data?: DocxBridgeDocument | null;
  /** Document title or file name for display */
  fileName?: string;
  /** Whether to render top toolbar with zoom, page navigation, download, etc. */
  showToolbar?: boolean;
  /** Custom wrapper CSS class name */
  className?: string;
  /** Callback fired when document finishes parsing/loading */
  onLoad?: (doc: DocxBridgeDocument) => void;
  /** Callback fired on loading/parsing failure */
  onError?: (error: Error) => void;
  /**
   * Callback fired when the user clicks the "Export JSON" button in the toolbar.
   * Receives the fully parsed DocxBridgeDocument object.
   * When provided, the toolbar will show an Export JSON button.
   */
  onJsonExport?: (doc: DocxBridgeDocument) => void;
  /**
   * When true, the toolbar Export JSON button will also auto-download the JSON file.
   * Defaults to true when onJsonExport is not provided but showJsonExport is true.
   */
  showJsonExport?: boolean;
  /**
   * When true, shows an external bottom-right page indicator pill on each page sheet.
   * Defaults to false so original DOCX headers/footers show cleanly.
   */
  showPageNumberPill?: boolean;
  /**
   * When false, hides watermarks from document pages.
   * Defaults to true.
   */
  showWatermark?: boolean;
}
