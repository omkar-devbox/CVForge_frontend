import type { DocxBridgeDocument, DocxViewerProps } from "../types/docxBridge.types";

/**
 * Convert a pre-parsed `DocxBridgeDocument` JSON object into ready-to-use
 * `DocxViewerProps` so you can spread them directly onto `<DocxViewer />`.
 *
 * @param json     - The parsed document (result of `docxToJson()`).
 * @param options  - Optional overrides for other viewer props.
 * @returns `DocxViewerProps` ready to spread onto `<DocxViewer />`.
 *
 * @example
 * const json = await docxToJson(file);
 * const props = jsonToDocxViewerProps(json, { fileName: "my-doc.docx" });
 * return <DocxViewer {...props} />;
 */
export function jsonToDocxViewerProps(
  json: DocxBridgeDocument,
  options?: Omit<DocxViewerProps, "data">
): DocxViewerProps {
  return {
    data: json,
    fileName: options?.fileName ?? "document.docx",
    showToolbar: options?.showToolbar ?? true,
    className: options?.className,
    onLoad: options?.onLoad,
    onError: options?.onError,
  };
}
