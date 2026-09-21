import type { DocxParagraph, DocxRun } from "../types";

/**
 * Parses paragraph properties from `<w:pPr>`.
 */
export function parseParagraphProperties(pPr: Element): Partial<DocxParagraph> {
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

/**
 * Parses run properties from `<w:rPr>`.
 */
export function parseRunProperties(rPr: Element): Partial<DocxRun> {
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
