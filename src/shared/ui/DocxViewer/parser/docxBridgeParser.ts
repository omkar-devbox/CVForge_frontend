import JSZip from "jszip";
import type {
  DocxBridgeDocument,
  DocxSection,
  DocxParagraph,
  DocxRun,
  DocxTable,
  DocxRow,
  DocxCell,
  DocxDrawing,
  DocxStyle,
  DocxNumberingData,
  DocxRelation,
  DocxHeaderFooter,
  DocxContentItem,
  DocxPageBorders,
  DocxSectionHeaders,
  DocxSectionFooters,
  DocxCellMargins,
} from "../types/docxBridge.types";

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Parses a .docx array buffer or JSON file into the docx-bridge JSON document format.
 */
export async function parseDocxBridgeFile(
  input: ArrayBuffer | Blob | string
): Promise<DocxBridgeDocument> {
  // If string — try JSON first
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (parsed && (parsed.sections || parsed.content)) {
        return normalizeDocxBridgeJson(parsed);
      }
    } catch {
      // not JSON
    }
  }

  // Convert Blob → ArrayBuffer
  let buffer: ArrayBuffer;
  if (typeof Blob !== "undefined" && input instanceof Blob) {
    buffer = await input.arrayBuffer();
  } else if (input instanceof ArrayBuffer) {
    buffer = input;
  } else if (input && typeof (input as any).arrayBuffer === "function") {
    buffer = await (input as any).arrayBuffer();
  } else if (input && (input as any).buffer instanceof ArrayBuffer) {
    const u8 = input as any;
    buffer = (u8.buffer as ArrayBuffer).slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  } else {
    throw new Error("Invalid input format for DOCX parsing");
  }

  // Check if this buffer is actually a JSON file (from docx-bridge python)
  try {
    const text = new TextDecoder("utf-8").decode(buffer);
    if (text.trim().startsWith("{") && text.includes('"sections"')) {
      return normalizeDocxBridgeJson(JSON.parse(text));
    }
  } catch {
    // Binary — fall through to ZIP parsing
  }

  return parseDocxArchive(buffer);
}

// ─── Core DOCX ZIP Parser ───────────────────────────────────────────────────

async function parseDocxArchive(buffer: ArrayBuffer): Promise<DocxBridgeDocument> {
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
      ext === "jpg" || ext === "jpeg" ? "image/jpeg"
        : ext === "svg" ? "image/svg+xml"
          : ext === "gif" ? "image/gif"
            : ext === "webp" ? "image/webp"
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
      stylesMap[styleId] = { id: styleId, name, type, basedOn, paragraph: paraProps, run: runProps, ...runProps };
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
        const startVal = parseInt(lvlEl.getElementsByTagName("w:start")[0]?.getAttribute("w:val") || "1", 10);
        const rFonts = lvlEl.getElementsByTagName("w:rFonts")[0];
        const font = rFonts?.getAttribute("w:ascii") || rFonts?.getAttribute("w:hAnsi") || undefined;

        // Extract indent from numbering level pPr (for hanging indent defaults)
        const lvlPPr = lvlEl.getElementsByTagName("w:pPr")[0];
        const lvlInd = lvlPPr?.getElementsByTagName("w:ind")[0];
        const indent = lvlInd ? {
          left: lvlInd.getAttribute("w:left") ? parseInt(lvlInd.getAttribute("w:left")!, 10) : undefined,
          hanging: lvlInd.getAttribute("w:hanging") ? parseInt(lvlInd.getAttribute("w:hanging")!, 10) : undefined,
        } : undefined;

        levels.push({ level: ilvl, format: numFmt, text: lvlText, bullet: lvlText, start: startVal, font, indent });
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
  const numberingData: DocxNumberingData = { abstractNums: parsedAbstractNums, nums: parsedNums };

  // ── 5. Parse Header/Footer XML files ──────────────────────────────────
  const parsedHF: Record<string, DocxHeaderFooter> = {};
  for (const [rId, { type: hfType, target }] of Object.entries(hfRels)) {
    const hfDoc = await getXmlDoc(`word/${target}`);
    if (!hfDoc) continue;
    const rootEl = hfDoc.getElementsByTagName("w:hdr")[0] || hfDoc.getElementsByTagName("w:ftr")[0];
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
        sections.push(createSection(pSectPr, currentSectionContent, parsedHF, evenAndOddHeaders));
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
    relations: Object.entries(relationsMap).map(([id, target]) => ({ id, type: "", target })),
    headers: docHeaders,
    footers: docFooters,
  };
}

// ─── JSON Normalizer ─────────────────────────────────────────────────────────

function normalizeDocxBridgeJson(json: any): DocxBridgeDocument {
  if (!json) return { sections: [] };
  if (json.content && !json.sections) {
    return {
      ...json,
      sections: [{
        page: json.page || {
          size: "a4",
          orientation: "portrait",
          margins: { top: 1440, bottom: 1440, left: 1440, right: 1440, header: 709, footer: 709 },
        },
        content: json.content,
      }],
    };
  }
  return json as DocxBridgeDocument;
}

// ─── Property Parsers ─────────────────────────────────────────────────────────

function parseParagraphProperties(pPr: Element): Partial<DocxParagraph> {
  const props: Partial<DocxParagraph> = {};

  const pStyle = pPr.getElementsByTagName("w:pStyle")[0];
  if (pStyle) props.style = pStyle.getAttribute("w:val") || undefined;

  const jc = pPr.getElementsByTagName("w:jc")[0];
  if (jc) props.alignment = (jc.getAttribute("w:val") || "left") as any;

  const spacing = pPr.getElementsByTagName("w:spacing")[0];
  if (spacing) {
    props.spacing = {
      before: spacing.getAttribute("w:before") ? parseInt(spacing.getAttribute("w:before")!, 10) : undefined,
      after: spacing.getAttribute("w:after") ? parseInt(spacing.getAttribute("w:after")!, 10) : undefined,
      line: spacing.getAttribute("w:line") ? parseInt(spacing.getAttribute("w:line")!, 10) : undefined,
      lineRule: spacing.getAttribute("w:lineRule") || undefined,
    };
  }

  const ind = pPr.getElementsByTagName("w:ind")[0];
  if (ind) {
    props.indent = {
      left: ind.getAttribute("w:left") ? parseInt(ind.getAttribute("w:left")!, 10) : undefined,
      right: ind.getAttribute("w:right") ? parseInt(ind.getAttribute("w:right")!, 10) : undefined,
      firstLine: ind.getAttribute("w:firstLine") ? parseInt(ind.getAttribute("w:firstLine")!, 10) : undefined,
      hanging: ind.getAttribute("w:hanging") ? parseInt(ind.getAttribute("w:hanging")!, 10) : undefined,
      start: ind.getAttribute("w:start") ? parseInt(ind.getAttribute("w:start")!, 10) : undefined,
      end: ind.getAttribute("w:end") ? parseInt(ind.getAttribute("w:end")!, 10) : undefined,
    };
  }

  const numPr = pPr.getElementsByTagName("w:numPr")[0];
  if (numPr) {
    const ilvl = numPr.getElementsByTagName("w:ilvl")[0]?.getAttribute("w:val");
    const numId = numPr.getElementsByTagName("w:numId")[0]?.getAttribute("w:val");
    props.numbering = {
      id: numId || undefined,
      numId: numId || undefined,
      level: ilvl ? parseInt(ilvl, 10) : 0,
      ilvl: ilvl ? parseInt(ilvl, 10) : 0,
    };
    props.level = props.numbering.level;
  }

  if (pPr.getElementsByTagName("w:pageBreakBefore").length > 0) {
    props.pageBreakBefore = true;
  }

  // Paragraph background shading
  const pShd = pPr.getElementsByTagName("w:shd")[0];
  if (pShd) {
    const fill = pShd.getAttribute("w:fill");
    if (fill && fill !== "auto" && fill.toUpperCase() !== "FFFFFF") {
      props.shading = { fill: `#${fill}` };
    }
  }

  // Paragraph borders
  const pBdr = pPr.getElementsByTagName("w:pBdr")[0] || pPr.getElementsByTagNameNS("*", "pBdr")[0];
  if (pBdr) {
    const borders: Record<string, any> = {};
    for (const side of ["top", "bottom", "left", "right", "between"]) {
      const bEl = pBdr.getElementsByTagName(`w:${side}`)[0] || pBdr.getElementsByTagNameNS("*", side)[0];
      if (bEl) {
        const val = bEl.getAttribute("w:val") || bEl.getAttribute("val") || "single";
        borders[side] = {
          val,
          sz: parseInt(bEl.getAttribute("w:sz") || bEl.getAttribute("sz") || "4", 10),
          color: bEl.getAttribute("w:color") || bEl.getAttribute("color") || "000000",
          space: parseInt(bEl.getAttribute("w:space") || bEl.getAttribute("space") || "0", 10),
        };
      }
    }
    if (Object.keys(borders).length > 0) props.borders = borders;
  }

  // Paragraph-level run properties (w:pPr/w:rPr)
  const pRPr = pPr.getElementsByTagName("w:rPr")[0] || pPr.getElementsByTagNameNS("*", "rPr")[0];
  if (pRPr) {
    const pRunProps = parseRunProperties(pRPr);
    if (pRunProps.color && pRunProps.color !== "auto") props.color = pRunProps.color;
    if (pRunProps.font) props.font = pRunProps.font;
    if (pRunProps.size) props.fontSize = pRunProps.size;
    if (pRunProps.fontSize) props.fontSize = pRunProps.fontSize;
    if (pRunProps.bold !== undefined) props.bold = pRunProps.bold;
    if (pRunProps.italic !== undefined) props.italic = pRunProps.italic;
    if (pRunProps.underline !== undefined) props.underline = pRunProps.underline;
  }

  return props;
}

function parseRunProperties(rPr: Element): Partial<DocxRun> {
  const props: Partial<DocxRun> = {};

  if (rPr.getElementsByTagName("w:b").length > 0) {
    const val = rPr.getElementsByTagName("w:b")[0].getAttribute("w:val");
    props.bold = val !== "0" && val !== "false";
  }
  if (rPr.getElementsByTagName("w:i").length > 0) {
    const val = rPr.getElementsByTagName("w:i")[0].getAttribute("w:val");
    props.italic = val !== "0" && val !== "false";
  }

  const u = rPr.getElementsByTagName("w:u")[0];
  if (u) {
    const val = u.getAttribute("w:val");
    if (val && val !== "none") props.underline = true;
  }

  if (rPr.getElementsByTagName("w:strike").length > 0) props.strike = true;
  if (rPr.getElementsByTagName("w:dstrike").length > 0) props.doubleStrike = true;

  const sz = rPr.getElementsByTagName("w:sz")[0];
  if (sz) {
    const val = sz.getAttribute("w:val");
    if (val) { props.size = parseInt(val, 10); props.fontSize = props.size; }
  }

  const color = rPr.getElementsByTagName("w:color")[0];
  if (color) {
    const val = color.getAttribute("w:val");
    if (val && val !== "auto") props.color = `#${val}`;
  }

  const highlight = rPr.getElementsByTagName("w:highlight")[0];
  if (highlight) props.highlight = highlight.getAttribute("w:val") || undefined;

  const shd = rPr.getElementsByTagName("w:shd")[0];
  if (shd) {
    const fill = shd.getAttribute("w:fill");
    if (fill && fill !== "auto" && fill !== "none") props.shading = `#${fill}`;
  }

  const rFonts = rPr.getElementsByTagName("w:rFonts")[0];
  if (rFonts) {
    props.font =
      rFonts.getAttribute("w:ascii") ||
      rFonts.getAttribute("w:hAnsi") ||
      rFonts.getAttribute("w:cs") ||
      undefined;
    props.fonts = {
      ascii: rFonts.getAttribute("w:ascii") || undefined,
      cs: rFonts.getAttribute("w:cs") || undefined,
      hAnsi: rFonts.getAttribute("w:hAnsi") || undefined,
    };
  }

  const vertAlign = rPr.getElementsByTagName("w:vertAlign")[0];
  if (vertAlign) props.vertAlign = vertAlign.getAttribute("w:val") as any;

  return props;
}

// ─── Element Parsers ──────────────────────────────────────────────────────────

function parseParagraph(
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

function parseRun(
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
        const d = parseDrawing(child, mediaMap, relationsMap);
        if (d) drawings.push(d);
        break;
      }
      case "AlternateContent": {
        const choice = child.getElementsByTagName("mc:Choice")[0] || child.getElementsByTagNameNS("*", "Choice")[0];
        const choiceDrawing = choice?.getElementsByTagName("w:drawing")[0] || choice?.getElementsByTagNameNS("*", "drawing")[0];
        if (choiceDrawing) {
          const d = parseDrawing(choiceDrawing, mediaMap, relationsMap);
          if (d) drawings.push(d);
        } else {
          const fallback = child.getElementsByTagName("mc:Fallback")[0] || child.getElementsByTagNameNS("*", "Fallback")[0];
          const fbDrawing = fallback?.getElementsByTagName("w:drawing")[0] || fallback?.getElementsByTagNameNS("*", "drawing")[0];
          if (fbDrawing) {
            const d = parseDrawing(fbDrawing, mediaMap, relationsMap);
            if (d) drawings.push(d);
          } else {
            const pict = fallback?.getElementsByTagName("w:pict")[0] || fallback?.getElementsByTagNameNS("*", "pict")[0];
            if (pict) {
              parsePictElement(pict, mediaMap, relationsMap, drawings, (t) => { text += t; });
            }
          }
        }
        break;
      }
      case "pict": {
        parsePictElement(child, mediaMap, relationsMap, drawings, (t) => { text += t; });
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

function parsePictElement(
  pictEl: Element,
  mediaMap: Record<string, string>,
  relationsMap: Record<string, string>,
  drawings: DocxDrawing[],
  appendTxt: (s: string) => void
) {
  // 1. VML image: v:imagedata
  const imgData = pictEl.getElementsByTagName("v:imagedata")[0] || pictEl.getElementsByTagNameNS("*", "imagedata")[0];
  const rId =
    imgData?.getAttribute("r:id") ||
    imgData?.getAttributeNS(REL_NS, "id") ||
    imgData?.getAttribute("id") ||
    "";
  if (rId) {
    const shape = pictEl.getElementsByTagName("v:shape")[0] || pictEl.getElementsByTagNameNS("*", "shape")[0];
    const styleStr = shape?.getAttribute("style") || "";
    let cx: number | undefined;
    let cy: number | undefined;
    const wMatch = styleStr.match(/width:\s*([\d.]+)(pt|px|in)?/);
    const hMatch = styleStr.match(/height:\s*([\d.]+)(pt|px|in)?/);
    if (wMatch) {
      const val = parseFloat(wMatch[1]);
      const unit = wMatch[2] || "pt";
      cx = unit === "in" ? Math.round(val * 914400) : unit === "px" ? Math.round(val * 9525) : Math.round(val * 12700);
    }
    if (hMatch) {
      const val = parseFloat(hMatch[1]);
      const unit = hMatch[2] || "pt";
      cy = unit === "in" ? Math.round(val * 914400) : unit === "px" ? Math.round(val * 9525) : Math.round(val * 12700);
    }
    drawings.push({
      type: "drawing",
      relationshipId: rId,
      src: mediaMap[rId] || relationsMap[rId],
      extent: { cx, cy, width: cx, height: cy },
    });
  }

  // 2. VML text box content: w:txbxContent
  const txbx = pictEl.getElementsByTagName("w:txbxContent")[0] || pictEl.getElementsByTagNameNS("*", "txbxContent")[0];
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

function parseDrawing(
  drawingEl: Element,
  mediaMap: Record<string, string>,
  relationsMap: Record<string, string>
): DocxDrawing | null {
  const blip =
    drawingEl.getElementsByTagName("a:blip")[0] ||
    drawingEl.getElementsByTagNameNS("*", "blip")[0];
  const rId =
    blip?.getAttribute("r:embed") ||
    blip?.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "embed") ||
    "";

  const extent =
    drawingEl.getElementsByTagName("wp:extent")[0] ||
    drawingEl.getElementsByTagNameNS("*", "extent")[0];
  const cx = extent?.getAttribute("cx") ? parseInt(extent.getAttribute("cx")!, 10) : undefined;
  const cy = extent?.getAttribute("cy") ? parseInt(extent.getAttribute("cy")!, 10) : undefined;

  const docPr = drawingEl.getElementsByTagName("wp:docPr")[0] || drawingEl.getElementsByTagNameNS("*", "docPr")[0];
  const name = docPr?.getAttribute("name") || docPr?.getAttribute("descr") || "";

  const posH = drawingEl.getElementsByTagName("wp:positionH")[0] || drawingEl.getElementsByTagNameNS("*", "positionH")[0];
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

  const anchor = drawingEl.getElementsByTagName("wp:anchor")[0] || drawingEl.getElementsByTagNameNS("*", "anchor")[0];
  const behindDoc = anchor?.getAttribute("behindDoc") === "1";
  const isWatermark =
    name.toLowerCase().includes("watermark") ||
    (anchor !== null && drawingEl.getElementsByTagName("a:lum").length > 0 && name.toLowerCase().includes("wordpicture"));

  // Check for textbox content inside drawing (e.g. wps:txbx / w:txbxContent)
  const txbx = drawingEl.getElementsByTagName("w:txbxContent")[0] || drawingEl.getElementsByTagNameNS("*", "txbxContent")[0];
  let textboxContent: DocxParagraph[] | undefined;
  if (txbx) {
    const pEls = Array.from(
      txbx.getElementsByTagName("w:p").length > 0
        ? txbx.getElementsByTagName("w:p")
        : txbx.getElementsByTagNameNS("*", "p")
    );
    const paras: DocxParagraph[] = [];
    for (const pEl of pEls) {
      paras.push(parseParagraph(pEl, mediaMap, relationsMap));
    }
    if (paras.length > 0) {
      textboxContent = paras;
    }
  }

  // Check for shape border and fill
  let borderColor: string | undefined;
  let borderWidth: number | undefined;
  let fillColor: string | undefined;

  const spPr = drawingEl.getElementsByTagName("wps:spPr")[0] || drawingEl.getElementsByTagNameNS("*", "spPr")[0];
  if (spPr) {
    const ln = spPr.getElementsByTagName("a:ln")[0] || spPr.getElementsByTagNameNS("*", "ln")[0];
    if (ln) {
      const noFill = ln.getElementsByTagName("a:noFill")[0] || ln.getElementsByTagNameNS("*", "noFill")[0];
      if (!noFill) {
        const lnSolidFill = ln.getElementsByTagName("a:solidFill")[0] || ln.getElementsByTagNameNS("*", "solidFill")[0];
        const srgbClr = lnSolidFill?.getElementsByTagName("a:srgbClr")[0] || lnSolidFill?.getElementsByTagNameNS("*", "srgbClr")[0];
        const val = srgbClr?.getAttribute("val");
        if (val) {
          borderColor = val;
          const w = ln.getAttribute("w");
          borderWidth = w ? Math.max(1, Math.round(parseInt(w, 10) / 12700)) : 1;
        }
      }
    }
    const solidFill = spPr.getElementsByTagName("a:solidFill")[0] || spPr.getElementsByTagNameNS("*", "solidFill")[0];
    if (solidFill && solidFill.parentElement === spPr) {
      const srgbClr = solidFill.getElementsByTagName("a:srgbClr")[0] || solidFill.getElementsByTagNameNS("*", "srgbClr")[0];
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
    src: rId ? (mediaMap[rId] || relationsMap[rId]) : undefined,
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

function parseTable(
  tblEl: Element,
  mediaMap: Record<string, string>,
  relationsMap: Record<string, string>
): DocxTable {
  // Column widths
  const gridCols: number[] = [];
  const tblGrid = tblEl.getElementsByTagName("w:tblGrid")[0];
  if (tblGrid) {
    const colEls = tblGrid.getElementsByTagName("w:gridCol");
    for (let i = 0; i < colEls.length; i++) {
      const w = colEls[i].getAttribute("w:w");
      if (w) gridCols.push(parseInt(w, 10));
    }
  }

  // Table-level properties: borders, alignment, cell margins
  const tblPr = tblEl.getElementsByTagName("w:tblPr")[0];
  const tableBorders: Record<string, any> = {};
  let tableAlignment: string | undefined;
  let tblCellMargins: DocxCellMargins | undefined;

  if (tblPr) {
    const jcEl = tblPr.getElementsByTagName("w:jc")[0];
    if (jcEl) tableAlignment = jcEl.getAttribute("w:val") || undefined;

    const tblBordersEl = tblPr.getElementsByTagName("w:tblBorders")[0];
    if (tblBordersEl) {
      for (const bName of ["top", "left", "bottom", "right", "insideH", "insideV"]) {
        const bEl = tblBordersEl.getElementsByTagName(`w:${bName}`)[0];
        if (bEl) {
          const val = bEl.getAttribute("w:val") || "single";
          tableBorders[bName] = {
            val,
            sz: bEl.getAttribute("w:sz") ? parseInt(bEl.getAttribute("w:sz")!, 10) : 4,
            color: bEl.getAttribute("w:color") || "000000",
          };
        }
      }
    }

    const tblCellMarEl = tblPr.getElementsByTagName("w:tblCellMar")[0];
    if (tblCellMarEl) {
      const getMar = (side: string) => {
        const el = tblCellMarEl.getElementsByTagName(`w:${side}`)[0];
        const w = el?.getAttribute("w:w");
        return w ? parseInt(w, 10) : undefined;
      };
      tblCellMargins = {
        top: getMar("top"),
        bottom: getMar("bottom"),
        left: getMar("left"),
        right: getMar("right"),
      };
    }
  }

  // Rows — only direct tr children (avoid picking up nested table rows)
  const rows: DocxRow[] = [];
  const allTrEls = tblEl.getElementsByTagName("w:tr");
  for (let i = 0; i < allTrEls.length; i++) {
    const tr = allTrEls[i];
    if (tr.parentElement !== tblEl) continue; // skip nested table rows

    // Row-level properties: row height
    let rowHeight: number | undefined;
    const trPr = tr.getElementsByTagName("w:trPr")[0];
    if (trPr) {
      const trHeightEl = trPr.getElementsByTagName("w:trHeight")[0];
      if (trHeightEl) {
        const hVal = trHeightEl.getAttribute("w:val");
        if (hVal) rowHeight = parseInt(hVal, 10);
      }
    }

    const cells: DocxCell[] = [];
    const allTcEls = tr.getElementsByTagName("w:tc");
    for (let j = 0; j < allTcEls.length; j++) {
      const tc = allTcEls[j];
      if (tc.parentElement !== tr) continue; // skip nested table cells

      const tcPr = tc.getElementsByTagName("w:tcPr")[0];
      let colSpan: number | undefined;
      let vMerge: any;
      let bg: string | undefined;
      let vAlign: any;
      let cellWidth: number | undefined;
      const cellBorders: Record<string, any> = {};
      let tcMargins: DocxCellMargins | undefined;

      if (tcPr) {
        const gridSpan = tcPr.getElementsByTagName("w:gridSpan")[0];
        if (gridSpan) {
          const val = gridSpan.getAttribute("w:val");
          if (val) colSpan = parseInt(val, 10);
        }

        const vMergeEl = tcPr.getElementsByTagName("w:vMerge")[0];
        if (vMergeEl) {
          vMerge = vMergeEl.getAttribute("w:val") === "restart" ? "restart" : "continue";
        }

        const shd = tcPr.getElementsByTagName("w:shd")[0];
        if (shd) {
          const fill = shd.getAttribute("w:fill");
          if (fill && fill !== "auto" && fill !== "none") bg = `#${fill}`;
        }

        const vAlignEl = tcPr.getElementsByTagName("w:vAlign")[0];
        if (vAlignEl) vAlign = vAlignEl.getAttribute("w:val");

        // Cell width (w:tcW)
        const tcWEl = tcPr.getElementsByTagName("w:tcW")[0];
        if (tcWEl) {
          const wVal = tcWEl.getAttribute("w:w");
          if (wVal) cellWidth = parseInt(wVal, 10);
        }

        // Cell margins (w:tcMar)
        const tcMarEl = tcPr.getElementsByTagName("w:tcMar")[0];
        if (tcMarEl) {
          const getMar = (side: string) => {
            const el = tcMarEl.getElementsByTagName(`w:${side}`)[0];
            const w = el?.getAttribute("w:w");
            return w ? parseInt(w, 10) : undefined;
          };
          tcMargins = {
            top: getMar("top"),
            bottom: getMar("bottom"),
            left: getMar("left"),
            right: getMar("right"),
          };
        }

        // Cell-level borders
        const tcBordersEl = tcPr.getElementsByTagName("w:tcBorders")[0];
        if (tcBordersEl) {
          for (const side of ["top", "bottom", "left", "right"]) {
            const bEl = tcBordersEl.getElementsByTagName(`w:${side}`)[0];
            if (bEl) {
              cellBorders[side] = {
                val: bEl.getAttribute("w:val") || "single",
                sz: parseInt(bEl.getAttribute("w:sz") || "4", 10),
                color: bEl.getAttribute("w:color") || "000000",
              };
            }
          }
        }
      }

      // Cell content — process direct children in order (paragraphs + nested tables)
      const cellContent: (DocxParagraph | DocxTable)[] = [];
      const tcChildren = Array.from(tc.childNodes).filter(
        (n) => n.nodeType === Node.ELEMENT_NODE
      ) as Element[];
      for (const tcChild of tcChildren) {
        const tcTag = tcChild.localName || tcChild.nodeName.split(":").pop();
        if (tcTag === "p") cellContent.push(parseParagraph(tcChild, mediaMap, relationsMap));
        else if (tcTag === "tbl") cellContent.push(parseTable(tcChild, mediaMap, relationsMap));
      }

      cells.push({
        colSpan: colSpan && colSpan > 1 ? colSpan : undefined,
        vMerge,
        bg,
        vAlign,
        width: cellWidth,
        margins: tcMargins,
        borders: Object.keys(cellBorders).length > 0 ? cellBorders as any : undefined,
        content: cellContent,
        paragraphs: cellContent.filter((c) => c.type === "paragraph") as DocxParagraph[],
      });
    }
    rows.push({ cells, height: rowHeight });
  }

  return {
    type: "table",
    grid: gridCols.length > 0 ? gridCols : undefined,
    rows,
    alignment: tableAlignment,
    borders: Object.keys(tableBorders).length > 0 ? tableBorders : undefined,
    cellMargins: tblCellMargins,
  };
}

// ─── Section Creator ──────────────────────────────────────────────────────────

const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

function createSection(
  sectPr: Element | null,
  content: any[],
  parsedHF: Record<string, DocxHeaderFooter> = {},
  evenAndOddHeaders: boolean = false
): DocxSection {
  if (!sectPr) {
    return {
      page: {
        size: "a4",
        orientation: "portrait",
        margins: { top: 1440, bottom: 1440, left: 1440, right: 1440, header: 709, footer: 709 },
      },
      content,
    };
  }

  // Page size
  const pgSz = sectPr.getElementsByTagName("w:pgSz")[0];
  const width = pgSz?.getAttribute("w:w") ? parseInt(pgSz.getAttribute("w:w")!, 10) : 11906;
  const height = pgSz?.getAttribute("w:h") ? parseInt(pgSz.getAttribute("w:h")!, 10) : 16838;
  const orient = (pgSz?.getAttribute("w:orient") || "portrait") as any;

  // Page margins (including header/footer distances)
  const pgMar = sectPr.getElementsByTagName("w:pgMar")[0];
  const margins = {
    top: pgMar?.getAttribute("w:top") ? parseInt(pgMar.getAttribute("w:top")!, 10) : 1440,
    right: pgMar?.getAttribute("w:right") ? parseInt(pgMar.getAttribute("w:right")!, 10) : 1440,
    bottom: pgMar?.getAttribute("w:bottom") ? parseInt(pgMar.getAttribute("w:bottom")!, 10) : 1440,
    left: pgMar?.getAttribute("w:left") ? parseInt(pgMar.getAttribute("w:left")!, 10) : 1440,
    header: pgMar?.getAttribute("w:header") ? parseInt(pgMar.getAttribute("w:header")!, 10) : 709,
    footer: pgMar?.getAttribute("w:footer") ? parseInt(pgMar.getAttribute("w:footer")!, 10) : 709,
    gutter: pgMar?.getAttribute("w:gutter") ? parseInt(pgMar.getAttribute("w:gutter")!, 10) : 0,
  };

  // Distinct title page (different first page header/footer)
  const titlePg = sectPr.getElementsByTagName("w:titlePg").length > 0;

  // Resolve headers map (first, default, even)
  const headersMap: DocxSectionHeaders = {};
  const headerRefs = sectPr.getElementsByTagName("w:headerReference");
  for (let i = 0; i < headerRefs.length; i++) {
    const refEl = headerRefs[i];
    const rId = refEl.getAttributeNS(REL_NS, "id") || refEl.getAttribute("r:id") || "";
    const wType = refEl.getAttribute("w:type") || "default";
    if (rId && parsedHF[rId]) {
      headersMap[wType] = parsedHF[rId];
    }
  }

  // Resolve footers map (first, default, even)
  const footersMap: DocxSectionFooters = {};
  const footerRefs = sectPr.getElementsByTagName("w:footerReference");
  for (let i = 0; i < footerRefs.length; i++) {
    const refEl = footerRefs[i];
    const rId = refEl.getAttributeNS(REL_NS, "id") || refEl.getAttribute("r:id") || "";
    const wType = refEl.getAttribute("w:type") || "default";
    if (rId && parsedHF[rId]) {
      footersMap[wType] = parsedHF[rId];
    }
  }

  // Default fallbacks for backward compatibility
  const sectionHeader = headersMap.default || headersMap.first || headersMap.even;
  const sectionFooter = footersMap.default || footersMap.first || footersMap.even;

  // Page Borders (w:pgBorders)
  let pageBorders: DocxPageBorders | undefined;
  const pgBordersEl = sectPr.getElementsByTagName("w:pgBorders")[0];
  if (pgBordersEl) {
    const offsetFrom = (pgBordersEl.getAttribute("w:offsetFrom") || "page") as any;
    const zOrder = (pgBordersEl.getAttribute("w:zOrder") || "front") as any;
    const borders: DocxPageBorders = { offsetFrom, zOrder };
    for (const side of ["top", "left", "bottom", "right"] as const) {
      const bEl = pgBordersEl.getElementsByTagName(`w:${side}`)[0];
      if (bEl) {
        const val = bEl.getAttribute("w:val") || "single";
        if (val && val !== "none" && val !== "nil") {
          borders[side] = {
            val,
            sz: bEl.getAttribute("w:sz") ? parseInt(bEl.getAttribute("w:sz")!, 10) : 4,
            space: bEl.getAttribute("w:space") ? parseInt(bEl.getAttribute("w:space")!, 10) : 24,
            color: bEl.getAttribute("w:color") || "000000",
          };
        }
      }
    }
    if (borders.top || borders.bottom || borders.left || borders.right) {
      pageBorders = borders;
    }
  }

  return {
    page: { size: { width, height }, orientation: orient, margins, borders: pageBorders },
    content,
    headers: headersMap,
    footers: footersMap,
    header: sectionHeader,
    footer: sectionFooter,
    titlePg,
    evenAndOddHeaders,
    pageBorders,
    borders: pageBorders,
  };
}
