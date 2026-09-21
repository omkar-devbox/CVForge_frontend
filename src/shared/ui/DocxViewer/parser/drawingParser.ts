import type { DocxDrawing, DocxParagraph } from "../types";

export const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

/**
 * Parses a VML `<w:pict>` element for imagedata and shape text box content.
 */
export function parsePictElement(
  pictEl: Element,
  mediaMap: Record<string, string>,
  relationsMap: Record<string, string>,
  drawings: DocxDrawing[],
  appendTxt: (s: string) => void
): void {
  // 1. VML image: v:imagedata
  const imgData =
    pictEl.getElementsByTagName("v:imagedata")[0] ||
    pictEl.getElementsByTagNameNS("*", "imagedata")[0];
  const rId =
    imgData?.getAttribute("r:id") ||
    imgData?.getAttributeNS(REL_NS, "id") ||
    imgData?.getAttribute("id") ||
    "";
  if (rId) {
    const shape =
      pictEl.getElementsByTagName("v:shape")[0] ||
      pictEl.getElementsByTagNameNS("*", "shape")[0];
    const styleStr = shape?.getAttribute("style") || "";
    let cx: number | undefined;
    let cy: number | undefined;
    const wMatch = styleStr.match(/width:\s*([\d.]+)(pt|px|in)?/);
    const hMatch = styleStr.match(/height:\s*([\d.]+)(pt|px|in)?/);
    if (wMatch) {
      const val = parseFloat(wMatch[1]);
      const unit = wMatch[2] || "pt";
      cx =
        unit === "in"
          ? Math.round(val * 914400)
          : unit === "px"
          ? Math.round(val * 9525)
          : Math.round(val * 12700);
    }
    if (hMatch) {
      const val = parseFloat(hMatch[1]);
      const unit = hMatch[2] || "pt";
      cy =
        unit === "in"
          ? Math.round(val * 914400)
          : unit === "px"
          ? Math.round(val * 9525)
          : Math.round(val * 12700);
    }
    drawings.push({
      type: "drawing",
      relationshipId: rId,
      src: mediaMap[rId] || relationsMap[rId],
      extent: { cx, cy, width: cx, height: cy },
    });
  }

  // 2. VML text box content: w:txbxContent
  const txbx =
    pictEl.getElementsByTagName("w:txbxContent")[0] ||
    pictEl.getElementsByTagNameNS("*", "txbxContent")[0];
  if (txbx) {
    const tEls = txbx.getElementsByTagName("w:t");
    const txbxTexts: string[] = [];
    for (let tIdx = 0; tIdx < tEls.length; tIdx++) {
      const tVal = tEls[tIdx].textContent;
      if (tVal) txbxTexts.push(tVal);
    }
    if (txbxTexts.length > 0) {
      appendTxt("\n" + txbxTexts.join("\n"));
    }
  }
}

/**
 * Parses a DrawingML `<w:drawing>` element.
 */
export function parseDrawing(
  drawingEl: Element,
  mediaMap: Record<string, string>,
  relationsMap: Record<string, string>,
  parseParagraphFn?: (
    pEl: Element,
    mediaMap: Record<string, string>,
    relationsMap: Record<string, string>
  ) => DocxParagraph
): DocxDrawing | null {
  const blip =
    drawingEl.getElementsByTagName("a:blip")[0] ||
    drawingEl.getElementsByTagNameNS("*", "blip")[0];
  const rId =
    blip?.getAttribute("r:embed") ||
    blip?.getAttributeNS(REL_NS, "embed") ||
    "";

  const extent =
    drawingEl.getElementsByTagName("wp:extent")[0] ||
    drawingEl.getElementsByTagNameNS("*", "extent")[0];
  const cx = extent?.getAttribute("cx") ? parseInt(extent.getAttribute("cx")!, 10) : undefined;
  const cy = extent?.getAttribute("cy") ? parseInt(extent.getAttribute("cy")!, 10) : undefined;

  const docPr =
    drawingEl.getElementsByTagName("wp:docPr")[0] ||
    drawingEl.getElementsByTagNameNS("*", "docPr")[0];
  const name = docPr?.getAttribute("name") || docPr?.getAttribute("descr") || "";

  const posH =
    drawingEl.getElementsByTagName("wp:positionH")[0] ||
    drawingEl.getElementsByTagNameNS("*", "positionH")[0];
  let alignH = posH?.getElementsByTagName("wp:align")[0]?.textContent || undefined;
  const posOffsetH = posH?.getElementsByTagName("wp:posOffset")[0]?.textContent;
  if (!alignH && posOffsetH) {
    const offsetNum = parseInt(posOffsetH, 10);
    // Positioned near center of the page (~1.8M to 3.8M EMU)
    if (offsetNum >= 1800000 && offsetNum <= 3800000) {
      alignH = "center";
    } else if (offsetNum <= 50000) {
      alignH = "left";
    }
  }

  const anchor =
    drawingEl.getElementsByTagName("wp:anchor")[0] ||
    drawingEl.getElementsByTagNameNS("*", "anchor")[0];
  const behindDoc = anchor?.getAttribute("behindDoc") === "1";
  const docPrDescr = docPr?.getAttribute("descr") || "";
  const docPrTitle = docPr?.getAttribute("title") || "";
  // In Word, watermarks explicitly contain "watermark" in their name, title, or description
  const isWatermark =
    name.toLowerCase().includes("watermark") ||
    docPrDescr.toLowerCase().includes("watermark") ||
    docPrTitle.toLowerCase().includes("watermark");

  // Check for textbox content inside drawing (e.g. wps:txbx / w:txbxContent)
  const txbx =
    drawingEl.getElementsByTagName("w:txbxContent")[0] ||
    drawingEl.getElementsByTagNameNS("*", "txbxContent")[0];
  let textboxContent: DocxParagraph[] | undefined;
  if (txbx && parseParagraphFn) {
    const pEls = Array.from(
      txbx.getElementsByTagName("w:p").length > 0
        ? txbx.getElementsByTagName("w:p")
        : txbx.getElementsByTagNameNS("*", "p")
    );
    const paras: DocxParagraph[] = [];
    for (const pEl of pEls) {
      paras.push(parseParagraphFn(pEl, mediaMap, relationsMap));
    }
    if (paras.length > 0) {
      textboxContent = paras;
    }
  }

  // Check for shape border and fill
  let borderColor: string | undefined;
  let borderWidth: number | undefined;
  let fillColor: string | undefined;

  const spPr =
    drawingEl.getElementsByTagName("wps:spPr")[0] ||
    drawingEl.getElementsByTagNameNS("*", "spPr")[0];
  if (spPr) {
    const ln =
      spPr.getElementsByTagName("a:ln")[0] ||
      spPr.getElementsByTagNameNS("*", "ln")[0];
    if (ln) {
      const noFill =
        ln.getElementsByTagName("a:noFill")[0] ||
        ln.getElementsByTagNameNS("*", "noFill")[0];
      if (!noFill) {
        const lnSolidFill =
          ln.getElementsByTagName("a:solidFill")[0] ||
          ln.getElementsByTagNameNS("*", "solidFill")[0];
        const srgbClr =
          lnSolidFill?.getElementsByTagName("a:srgbClr")[0] ||
          lnSolidFill?.getElementsByTagNameNS("*", "srgbClr")[0];
        const val = srgbClr?.getAttribute("val");
        if (val) {
          borderColor = val;
          const w = ln.getAttribute("w");
          borderWidth = w ? Math.max(1, Math.round(parseInt(w, 10) / 12700)) : 1;
        }
      }
    }
    const solidFill =
      spPr.getElementsByTagName("a:solidFill")[0] ||
      spPr.getElementsByTagNameNS("*", "solidFill")[0];
    if (solidFill && solidFill.parentElement === spPr) {
      const srgbClr =
        solidFill.getElementsByTagName("a:srgbClr")[0] ||
        solidFill.getElementsByTagNameNS("*", "srgbClr")[0];
      const val = srgbClr?.getAttribute("val");
      if (val && val.toUpperCase() !== "FFFFFF") {
        fillColor = val;
      }
    }
  }

  // If no blip and no textboxContent, return null
  if (!rId && (!textboxContent || textboxContent.length === 0)) {
    return null;
  }

  return {
    type: "drawing",
    name,
    relationshipId: rId,
    src: rId ? mediaMap[rId] || relationsMap[rId] : undefined,
    extent: { cx, cy, width: cx, height: cy },
    positionH: alignH ? { align: alignH } : undefined,
    behindDoc,
    isWatermark,
    borderColor,
    borderWidth,
    fillColor,
    textboxContent,
  };
}
