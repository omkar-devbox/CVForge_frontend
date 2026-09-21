import type { DocxParagraph, DocxRun, DocxDrawing } from "../types";
import { parseParagraphProperties, parseRunProperties } from "./propertiesParser";
import { parseDrawing, parsePictElement } from "./drawingParser";

/**
 * Parses a `<w:p>` paragraph element.
 */
export function parseParagraph(
  pEl: Element,
  mediaMap: Record<string, string>,
  relationsMap: Record<string, string>
): DocxParagraph {
  const pPr = pEl.getElementsByTagName("w:pPr")[0];
  const paraProps = pPr ? parseParagraphProperties(pPr) : {};
  const runs: DocxRun[] = [];
  let fullText = "";
  let currentField: "PAGE" | "NUMPAGES" | undefined = undefined;

  const children = Array.from(pEl.childNodes).filter(
    (n) => n.nodeType === Node.ELEMENT_NODE
  ) as Element[];

  for (const child of children) {
    const tag = child.localName || child.nodeName.split(":").pop();
    if (tag === "r") {
      // Check for field instruction in this run or previous run
      const instrEl = child.getElementsByTagName("w:instrText")[0];
      if (instrEl) {
        const text = (instrEl.textContent || "").trim();
        if (/\bNUMPAGES\b/i.test(text)) currentField = "NUMPAGES";
        else if (/\bPAGE\b/i.test(text)) currentField = "PAGE";
      }

      const run = parseRun(child, mediaMap, relationsMap);
      if (currentField && run.text && run.text.trim()) {
        run.field = currentField;
      }
      runs.push(run);
      if (run.text) fullText += run.text;

      // Close field on fldChar end
      const fldCharEl = child.getElementsByTagName("w:fldChar")[0];
      if (fldCharEl && fldCharEl.getAttribute("w:fldCharType") === "end") {
        currentField = undefined;
      }
    } else if (tag === "fldSimple") {
      const instr = child.getAttribute("w:instr") || "";
      let simpleField: "PAGE" | "NUMPAGES" | undefined = undefined;
      if (/\bNUMPAGES\b/i.test(instr)) simpleField = "NUMPAGES";
      else if (/\bPAGE\b/i.test(instr)) simpleField = "PAGE";

      const rEls = child.getElementsByTagName("w:r");
      if (rEls.length === 0 && simpleField) {
        runs.push({ field: simpleField, text: "1" });
        fullText += "1";
      } else {
        for (let k = 0; k < rEls.length; k++) {
          const run = parseRun(rEls[k], mediaMap, relationsMap);
          if (simpleField) run.field = simpleField;
          runs.push(run);
          if (run.text) fullText += run.text;
        }
      }
    } else if (tag === "hyperlink") {
      // Treat hyperlink runs as underlined blue text
      const rEls = child.getElementsByTagName("w:r");
      for (let k = 0; k < rEls.length; k++) {
        const run = parseRun(rEls[k], mediaMap, relationsMap);
        run.underline = run.underline ?? true;
        run.color = run.color ?? "#0563C1";
        runs.push(run);
        if (run.text) fullText += run.text;
      }
    }
  }

  return { type: "paragraph", ...paraProps, text: fullText, runs };
}

/**
 * Parses a `<w:r>` text run element.
 */
export function parseRun(
  rEl: Element,
  mediaMap: Record<string, string>,
  relationsMap: Record<string, string>
): DocxRun {
  const rPr = rEl.getElementsByTagName("w:rPr")[0];
  const runProps = rPr ? parseRunProperties(rPr) : {};

  let text = "";
  const breaks: any[] = [];
  const drawings: DocxDrawing[] = [];

  // Process children in document order to preserve content sequence (tabs, breaks, etc.)
  const children = Array.from(rEl.childNodes).filter(
    (n) => n.nodeType === Node.ELEMENT_NODE
  ) as Element[];

  for (const child of children) {
    const tag = child.localName || child.nodeName.split(":").pop();
    switch (tag) {
      case "t":
        text += child.textContent || "";
        break;
      case "tab":
        text += "\t";
        break;
      case "br": {
        const brType = child.getAttribute("w:type") || "line";
        breaks.push({ type: brType });
        break;
      }
      case "lastRenderedPageBreak": {
        breaks.push({ type: "page" });
        break;
      }
      case "drawing": {
        const d = parseDrawing(child, mediaMap, relationsMap, parseParagraph);
        if (d) drawings.push(d);
        break;
      }
      case "AlternateContent": {
        const choice =
          child.getElementsByTagName("mc:Choice")[0] ||
          child.getElementsByTagNameNS("*", "Choice")[0];
        const choiceDrawing =
          choice?.getElementsByTagName("w:drawing")[0] ||
          choice?.getElementsByTagNameNS("*", "drawing")[0];
        if (choiceDrawing) {
          const d = parseDrawing(choiceDrawing, mediaMap, relationsMap, parseParagraph);
          if (d) drawings.push(d);
        } else {
          const fallback =
            child.getElementsByTagName("mc:Fallback")[0] ||
            child.getElementsByTagNameNS("*", "Fallback")[0];
          const fbDrawing =
            fallback?.getElementsByTagName("w:drawing")[0] ||
            fallback?.getElementsByTagNameNS("*", "drawing")[0];
          if (fbDrawing) {
            const d = parseDrawing(fbDrawing, mediaMap, relationsMap, parseParagraph);
            if (d) drawings.push(d);
          } else {
            const pict =
              fallback?.getElementsByTagName("w:pict")[0] ||
              fallback?.getElementsByTagNameNS("*", "pict")[0];
            if (pict) {
              parsePictElement(pict, mediaMap, relationsMap, drawings, (t) => {
                text += t;
              });
            }
          }
        }
        break;
      }
      case "pict": {
        parsePictElement(child, mediaMap, relationsMap, drawings, (t) => {
          text += t;
        });
        break;
      }
      default:
        break;
    }
  }

  return {
    ...runProps,
    text: text || undefined,
    breaks: breaks.length > 0 ? breaks : undefined,
    drawings: drawings.length > 0 ? drawings : undefined,
  };
}
