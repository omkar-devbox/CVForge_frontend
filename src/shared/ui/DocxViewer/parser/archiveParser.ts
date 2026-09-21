import JSZip from "jszip";
import type {
  DocxBridgeDocument,
  DocxSection,
  DocxStyle,
  DocxNumberingData,
  DocxHeaderFooter,
  DocxContentItem,
} from "../types";
import { parseParagraphProperties, parseRunProperties } from "./propertiesParser";
import { parseParagraph } from "./paragraphParser";
import { parseTable } from "./tableParser";
import { createSection } from "./sectionParser";

/**
 * Extracts and parses a .docx ZIP archive buffer into DocxBridgeDocument.
 */
export async function parseDocxArchive(buffer: ArrayBuffer): Promise<DocxBridgeDocument> {
  const zip = await JSZip.loadAsync(buffer);
  const domParser = new DOMParser();

  /** Helper to load and parse an XML file from the ZIP */
  const getXmlDoc = async (filename: string): Promise<Document | null> => {
    const file = zip.file(filename);
    if (!file) return null;
    const content = await file.async("string");
    return domParser.parseFromString(content, "application/xml");
  };

  // ── 1. Extract Media ───────────────────────────────────────────────────
  const mediaMap: Record<string, string> = {};
  const mediaFiles = zip.file(/^word\/media\//);
  for (const file of mediaFiles) {
    const filename = file.name;
    const ext = filename.split(".").pop()?.toLowerCase() || "png";
    const mime =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "svg"
        ? "image/svg+xml"
        : ext === "gif"
        ? "image/gif"
        : ext === "webp"
        ? "image/webp"
        : "image/png";
    const base64 = await file.async("base64");
    const dataUrl = `data:${mime};base64,${base64}`;
    mediaMap[filename] = dataUrl;
    mediaMap[filename.replace(/^word\//, "")] = dataUrl;
    const shortName = filename.split("/").pop();
    if (shortName) mediaMap[shortName] = dataUrl;
  }

  // ── 2. Parse Relationships ─────────────────────────────────────────────
  const relationsMap: Record<string, string> = {};
  /** rId → {type, target} for header/footer XML files */
  const hfRels: Record<string, { type: "header" | "footer"; target: string }> = {};

  const relsDoc = await getXmlDoc("word/_rels/document.xml.rels");
  if (relsDoc) {
    const relEls = relsDoc.getElementsByTagName("Relationship");
    for (let i = 0; i < relEls.length; i++) {
      const el = relEls[i];
      const id = el.getAttribute("Id") || "";
      const target = el.getAttribute("Target") || "";
      const relType = el.getAttribute("Type") || "";
      if (!id || !target) continue;

      relationsMap[id] = target;
      // Map media rId → data URL
      const tFilename = target.split("/").pop();
      if (tFilename && mediaMap[tFilename]) mediaMap[id] = mediaMap[tFilename];

      // Identify header/footer relationship types
      if (relType.includes("/header")) hfRels[id] = { type: "header", target };
      else if (relType.includes("/footer")) hfRels[id] = { type: "footer", target };
    }
  }

  // ── 3. Parse Styles ────────────────────────────────────────────────────
  const stylesMap: Record<string, DocxStyle> = {};
  const stylesDoc = await getXmlDoc("word/styles.xml");
  if (stylesDoc) {
    const styleEls = stylesDoc.getElementsByTagName("w:style");
    for (let i = 0; i < styleEls.length; i++) {
      const el = styleEls[i];
      const styleId = el.getAttribute("w:styleId") || "";
      const nameEl = el.getElementsByTagName("w:name")[0];
      const name = nameEl?.getAttribute("w:val") || styleId;
      const type = (el.getAttribute("w:type") || "paragraph") as any;
      const rPr = el.getElementsByTagName("w:rPr")[0];
      const pPr = el.getElementsByTagName("w:pPr")[0];
      const basedOnEl = el.getElementsByTagName("w:basedOn")[0];
      const basedOn = basedOnEl?.getAttribute("w:val") || undefined;
      const runProps = rPr ? parseRunProperties(rPr) : {};
      const paraProps = pPr ? parseParagraphProperties(pPr) : {};
      stylesMap[styleId] = {
        id: styleId,
        name,
        type,
        basedOn,
        paragraph: paraProps,
        run: runProps,
        ...runProps,
      };
    }

    // ── Also parse w:docDefaults (document-level default font/size) ────────
    const docDefaultsEl = stylesDoc.getElementsByTagName("w:docDefaults")[0];
    if (docDefaultsEl) {
      const defRPrEl = docDefaultsEl.getElementsByTagName("w:rPrDefault")[0];
      const defRPr = defRPrEl?.getElementsByTagName("w:rPr")[0];
      if (defRPr) {
        const defRunProps = parseRunProperties(defRPr);
        stylesMap["__docDefaults__"] = {
          id: "__docDefaults__",
          name: "Document Defaults",
          type: "character",
          run: defRunProps,
          ...defRunProps,
        };
      }
    }
  }

  // ── 4. Parse Numbering ─────────────────────────────────────────────────
  const parsedAbstractNums: any[] = [];
  const parsedNums: any[] = [];
  const numberingDoc = await getXmlDoc("word/numbering.xml");
  if (numberingDoc) {
    const abstractEls = numberingDoc.getElementsByTagName("w:abstractNum");
    for (let i = 0; i < abstractEls.length; i++) {
      const el = abstractEls[i];
      const absId = el.getAttribute("w:abstractNumId") || "";
      const levels: any[] = [];
      const lvlEls = el.getElementsByTagName("w:lvl");
      for (let j = 0; j < lvlEls.length; j++) {
        const lvlEl = lvlEls[j];
        const ilvl = parseInt(lvlEl.getAttribute("w:ilvl") || "0", 10);
        const numFmt = lvlEl.getElementsByTagName("w:numFmt")[0]?.getAttribute("w:val") || "bullet";
        const lvlText = lvlEl.getElementsByTagName("w:lvlText")[0]?.getAttribute("w:val") || "•";
        const startVal = parseInt(
          lvlEl.getElementsByTagName("w:start")[0]?.getAttribute("w:val") || "1",
          10
        );
        const rFonts = lvlEl.getElementsByTagName("w:rFonts")[0];
        const font =
          rFonts?.getAttribute("w:ascii") || rFonts?.getAttribute("w:hAnsi") || undefined;

        // Extract indent from numbering level pPr (for hanging indent defaults)
        const lvlPPr = lvlEl.getElementsByTagName("w:pPr")[0];
        const lvlInd = lvlPPr?.getElementsByTagName("w:ind")[0];
        const indent = lvlInd
          ? {
              left: lvlInd.getAttribute("w:left")
                ? parseInt(lvlInd.getAttribute("w:left")!, 10)
                : undefined,
              hanging: lvlInd.getAttribute("w:hanging")
                ? parseInt(lvlInd.getAttribute("w:hanging")!, 10)
                : undefined,
            }
          : undefined;

        levels.push({
          level: ilvl,
          format: numFmt,
          text: lvlText,
          bullet: lvlText,
          start: startVal,
          font,
          indent,
        });
      }
      parsedAbstractNums.push({ id: absId, abstractNumId: absId, levels });
    }
    const numEls = numberingDoc.getElementsByTagName("w:num");
    for (let i = 0; i < numEls.length; i++) {
      const el = numEls[i];
      const numId = el.getAttribute("w:numId") || "";
      const absId = el.getElementsByTagName("w:abstractNumId")[0]?.getAttribute("w:val") || "";
      parsedNums.push({ id: numId, numId, abstractNumId: absId });
    }
  }
  const numberingData: DocxNumberingData = {
    abstractNums: parsedAbstractNums,
    nums: parsedNums,
  };

  // ── 5. Parse Header/Footer XML files ──────────────────────────────────
  const parsedHF: Record<string, DocxHeaderFooter> = {};
  for (const [rId, { type: hfType, target }] of Object.entries(hfRels)) {
    const hfDoc = await getXmlDoc(`word/${target}`);
    if (!hfDoc) continue;
    const rootEl =
      hfDoc.getElementsByTagName("w:hdr")[0] || hfDoc.getElementsByTagName("w:ftr")[0];
    if (!rootEl) continue;

    // Load scoped relationships for this header/footer file
    const targetFile = target.split("/").pop() || target;
    const hfRelsPath = `word/_rels/${targetFile}.rels`;
    const hfRelsDoc = await getXmlDoc(hfRelsPath);
    const hfRelationsMap: Record<string, string> = { ...relationsMap };
    const hfMediaMap: Record<string, string> = { ...mediaMap };

    if (hfRelsDoc) {
      const relEls = hfRelsDoc.getElementsByTagName("Relationship");
      for (let k = 0; k < relEls.length; k++) {
        const rEl = relEls[k];
        const relId = rEl.getAttribute("Id") || "";
        const relTarget = rEl.getAttribute("Target") || "";
        if (!relId || !relTarget) continue;
        hfRelationsMap[relId] = relTarget;

        const tFile = relTarget.split("/").pop();
        if (tFile && mediaMap[tFile]) {
          hfMediaMap[relId] = mediaMap[tFile];
        } else if (mediaMap[relTarget]) {
          hfMediaMap[relId] = mediaMap[relTarget];
        }
      }
    }

    const hfContent: DocxContentItem[] = [];
    const hfChildren = Array.from(rootEl.childNodes).filter(
      (n) => n.nodeType === Node.ELEMENT_NODE
    ) as Element[];
    for (const child of hfChildren) {
      const tag = child.localName || child.nodeName.split(":").pop();
      if (tag === "p") hfContent.push(parseParagraph(child, hfMediaMap, hfRelationsMap));
      else if (tag === "tbl") hfContent.push(parseTable(child, hfMediaMap, hfRelationsMap));
    }
    parsedHF[rId] = { type: hfType, id: rId, content: hfContent };
  }

  // ── 6. Parse settings.xml ─────────────────────────────────────────────
  const settingsDoc = await getXmlDoc("word/settings.xml");
  const evenAndOddHeaders = settingsDoc
    ? settingsDoc.getElementsByTagName("w:evenAndOddHeaders").length > 0
    : false;

  // ── 7. Parse Document XML ──────────────────────────────────────────────
  const docXml = await getXmlDoc("word/document.xml");
  if (!docXml) throw new Error("Could not find word/document.xml in DOCX archive");

  const body = docXml.getElementsByTagName("w:body")[0];
  if (!body) throw new Error("Invalid DOCX format: missing <w:body>");

  const sections: DocxSection[] = [];
  let currentSectionContent: any[] = [];

  const bodyChildren = Array.from(body.childNodes).filter(
    (n) => n.nodeType === Node.ELEMENT_NODE
  ) as Element[];

  for (const child of bodyChildren) {
    const tag = child.localName || child.nodeName.split(":").pop();
    if (tag === "p") {
      currentSectionContent.push(parseParagraph(child, mediaMap, relationsMap));
      // Check for mid-paragraph section break
      const pSectPr = child.getElementsByTagName("w:sectPr")[0];
      if (pSectPr) {
        sections.push(
          createSection(pSectPr, currentSectionContent, parsedHF, evenAndOddHeaders)
        );
        currentSectionContent = [];
      }
    } else if (tag === "tbl") {
      currentSectionContent.push(parseTable(child, mediaMap, relationsMap));
    }
  }

  // Final body-level sectPr
  const bodySectPr = body.getElementsByTagName("w:sectPr")[0];
  if (currentSectionContent.length > 0 || sections.length === 0) {
    sections.push(createSection(bodySectPr, currentSectionContent, parsedHF, evenAndOddHeaders));
  }

  // Separate global headers/footers for DocumentContext fallback
  const docHeaders: Record<string, DocxHeaderFooter> = {};
  const docFooters: Record<string, DocxHeaderFooter> = {};
  for (const [rId, hf] of Object.entries(parsedHF)) {
    if (hf.type === "header") docHeaders[rId] = hf;
    else docFooters[rId] = hf;
  }

  return {
    sections,
    styles: stylesMap,
    numbering: numberingData,
    media: mediaMap,
    relations: Object.entries(relationsMap).map(([id, target]) => ({
      id,
      type: "",
      target,
    })),
    headers: docHeaders,
    footers: docFooters,
  };
}
