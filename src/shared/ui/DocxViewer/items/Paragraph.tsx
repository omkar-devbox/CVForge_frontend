import React from "react";
import type { DocxParagraph, DocxRun, DocxStyle } from "../types/docxBridge.types";
import { Run } from "./Run";
import { useDocument } from "../context/DocumentContext";
import { resolveFontFamily } from "../utils/fontUtils";

interface ParagraphProps {
  paragraph: DocxParagraph;
  inHeaderFooter?: boolean;
}

function splitRunsByTabs(runs: DocxRun[]): DocxRun[][] {
  const zones: DocxRun[][] = [[]];
  for (const r of runs) {
    const txt = r.text ?? "";
    if (!txt.includes("\t")) {
      zones[zones.length - 1].push(r);
    } else {
      const parts = txt.split("\t");
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) zones.push([]);
        if (parts[i] || (i === 0 && r.drawings && r.drawings.length > 0)) {
          zones[zones.length - 1].push({
            ...r,
            text: parts[i],
            drawings: i === 0 ? r.drawings : undefined,
          });
        }
      }
    }
  }
  return zones;
}

// ─── Heading detection ────────────────────────────────────────────────────────
// Matches both OOXML styleIds ("Heading1", "2") and name aliases ("heading 1", "h1")
function detectHeadingLevel(styleId?: string, styleName?: string): number | null {
  const check = (str?: string) => {
    if (!str) return null;
    const s = str.toLowerCase().replace(/\s+/g, "");
    if (/^(title|tit)$/.test(s)) return 0; // Title → level 0
    const m = s.match(/^(heading|h)(\d)$/);
    if (m) return parseInt(m[2], 10); // Heading1 → 1, h2 → 2, etc.
    return null;
  };
  return check(styleId) ?? check(styleName);
}

// ─── Border style mapper ───────────────────────────────────────────────────────
function mapBorderStyle(val: string): string {
  switch (val) {
    case "double": return "double";
    case "dashed": case "dashDot": return "dashed";
    case "dotted": return "dotted";
    case "none": case "nil": return "none";
    default: return "solid";
  }
}

function fmtParaBorder(b: any): string | undefined {
  if (!b) return undefined;
  const val = b.val || "single";
  if (val === "none" || val === "nil") return undefined;
  const style = mapBorderStyle(val);
  if (style === "none") return undefined;
  // sz is in 1/8 pt -> px (1pt = 96/72 px = 1.333px)
  const width = b.sz ? `${Math.max(1, Math.round((b.sz / 8) * (96 / 72)))}px` : "1px";
  const color = b.color && b.color !== "auto" ? `#${(b.color as string).replace("#", "")}` : "#000000";
  return `${width} ${style} ${color}`;
}

// ─── Style run defaults extractor ────────────────────────────────────────────
// Walks a style (+ basedOn chain via stylesMap) and collects run-level defaults.
// Falls back to __docDefaults__ (document-level w:docDefaults) at the end.
function collectStyleRunDefaults(
  styleId: string | undefined,
  stylesMap: Record<string, DocxStyle>
): Partial<DocxRun> {
  const defaults: Partial<DocxRun> = {};
  const visited = new Set<string>();

  // Walk the basedOn chain (most-derived → base)
  let current: DocxStyle | undefined = styleId ? stylesMap[styleId] : undefined;
  while (current && !visited.has(current.id || "")) {
    visited.add(current.id || "");

    const run = current.run || {};
    // Only apply if not already set by a more-derived style
    if (run.font && !defaults.font) defaults.font = run.font;
    if (run.fonts && !defaults.fonts) defaults.fonts = run.fonts;
    if (run.size && !defaults.size) defaults.size = run.size;
    if (run.fontSize && !defaults.fontSize) defaults.fontSize = run.fontSize;
    if (run.color && !defaults.color) defaults.color = run.color;
    if (run.bold !== undefined && defaults.bold === undefined) defaults.bold = run.bold;
    if (run.italic !== undefined && defaults.italic === undefined) defaults.italic = run.italic;

    // Also check top-level style run shortcuts (parser puts them there too)
    if ((current as any).font && !defaults.font) defaults.font = (current as any).font;
    if ((current as any).size && !defaults.size) defaults.size = (current as any).size;
    if ((current as any).fontSize && !defaults.fontSize) defaults.fontSize = (current as any).fontSize;
    if ((current as any).color && !defaults.color) defaults.color = (current as any).color;

    const nextId = current.basedOn;
    current = nextId ? stylesMap[nextId] : undefined;
  }

  // Final fallback: document-level defaults (w:docDefaults → w:rPrDefault)
  const docDef = stylesMap["__docDefaults__"];
  if (docDef) {
    const dRun = docDef.run || {};
    if (!defaults.font && dRun.font) defaults.font = dRun.font;
    if (!defaults.fonts && dRun.fonts) defaults.fonts = dRun.fonts;
    if (!defaults.size && dRun.size) defaults.size = dRun.size;
    if (!defaults.fontSize && dRun.fontSize) defaults.fontSize = dRun.fontSize;
    if (!defaults.color && dRun.color) defaults.color = dRun.color;
    // Don't force bold/italic from docDefaults
  }

  return defaults;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Paragraph: React.FC<ParagraphProps> = ({ paragraph, inHeaderFooter = false }) => {
  const { resolveBulletOrNumber, resolveStyle, styles } = useDocument();

  const styleObj = resolveStyle(paragraph.style);
  const spacing = paragraph.spacing || styleObj?.paragraph?.spacing;
  const indent = paragraph.indent || paragraph.indentation || styleObj?.paragraph?.indent;

  // Collect run-level defaults from the paragraph's style (+ basedOn chain)
  const styleRunDefaults = collectStyleRunDefaults(paragraph.style, styles as Record<string, DocxStyle>);

  // Merge paragraph-level rPr overrides into effective defaults for runs
  const effectiveRunDefaults: Partial<DocxRun> = {
    ...styleRunDefaults,
    ...(paragraph.font ? { font: paragraph.font } : {}),
    ...(paragraph.fontSize || paragraph.size ? { size: paragraph.fontSize || paragraph.size } : {}),
    ...(paragraph.color && paragraph.color !== "auto" ? { color: paragraph.color } : {}),
    ...(paragraph.bold !== undefined ? { bold: paragraph.bold } : {}),
    ...(paragraph.italic !== undefined ? { italic: paragraph.italic } : {}),
    ...(paragraph.underline !== undefined ? { underline: paragraph.underline } : {}),
  };

  const style: React.CSSProperties = { position: "relative" };

  // ── Default document font/size from style (applied to the paragraph wrapper)
  const defaultFont = effectiveRunDefaults.font ?? effectiveRunDefaults.fonts?.ascii ?? effectiveRunDefaults.fonts?.hAnsi;
  const defaultSizeHp = effectiveRunDefaults.size ?? effectiveRunDefaults.fontSize;
  if (defaultFont) {
    style.fontFamily = resolveFontFamily(defaultFont);
  }
  if (defaultSizeHp) {
    style.fontSize = `${defaultSizeHp / 2}pt`;
  }
  if (effectiveRunDefaults.color && effectiveRunDefaults.color !== "auto") {
    style.color = effectiveRunDefaults.color.startsWith("#") ? effectiveRunDefaults.color : `#${effectiveRunDefaults.color}`;
  }

  // ── Alignment ─────────────────────────────────────────────────────────
  const hasTextboxDrawing =
    paragraph.runs?.some(
      (r) => r.drawings && r.drawings.some((d) => d.textboxContent && d.textboxContent.length > 0)
    ) || paragraph.drawings?.some((d) => d.textboxContent && d.textboxContent.length > 0);

  const alignment = hasTextboxDrawing ? "left" : (paragraph.alignment || styleObj?.paragraph?.alignment || "left");
  switch (alignment) {
    case "center": style.textAlign = "center"; break;
    case "right": style.textAlign = "right"; break;
    case "both": case "justify": style.textAlign = "justify"; break;
    default: style.textAlign = "left";
  }

  // ── Spacing before/after ──────────────────────────────────────────────
  if (spacing?.before) style.marginTop = `${spacing.before / 20}pt`;
  if (spacing?.after !== undefined) {
    style.marginBottom = spacing.after > 0 ? `${spacing.after / 20}pt` : "0";
  } else {
    style.marginBottom = "0";
  }

  // ── Line height ───────────────────────────────────────────────────────
  if (spacing?.line) {
    if (spacing.lineRule === "exact" || spacing.lineRule === "atLeast") {
      style.lineHeight = `${spacing.line / 20}pt`;
    } else {
      style.lineHeight = spacing.line / 240;
    }
  } else {
    style.lineHeight = 1.15;
  }

  // ── Indentation ───────────────────────────────────────────────────────
  const leftDxa = indent?.left ?? indent?.start ?? 0;
  const rightDxa = indent?.right ?? indent?.end ?? 0;
  const hangingDxa = indent?.hanging ?? 0;
  const firstDxa = indent?.firstLine ?? 0;

  if (leftDxa !== 0 || hangingDxa > 0) {
    if (leftDxa > 0) {
      style.paddingLeft = `${leftDxa / 15}px`;
    } else if (leftDxa < 0) {
      style.marginLeft = `${leftDxa / 15}px`;
    }
  }
  if (rightDxa !== 0) {
    if (rightDxa > 0) {
      style.paddingRight = `${rightDxa / 15}px`;
    } else if (rightDxa < 0) {
      style.marginRight = `${rightDxa / 15}px`;
    }
  }
  if (hangingDxa > 0) {
    style.textIndent = `-${hangingDxa / 15}px`;
  } else if (firstDxa > 0) {
    style.textIndent = `${firstDxa / 15}px`;
  }

  // ── Paragraph background shading ──────────────────────────────────────
  const paraShading = paragraph.shading || styleObj?.paragraph?.shading;
  if (paraShading) {
    const fill = typeof paraShading === "object" ? paraShading.fill : paraShading;
    if (fill && fill !== "auto" && fill !== "none") {
      style.backgroundColor = fill.startsWith("#") ? fill : `#${fill}`;
    }
  }

  // ── Paragraph borders ─────────────────────────────────────────────────
  const paraBorders = paragraph.borders as Record<string, any> | undefined;
  if (paraBorders) {
    const borderPadding = 4;
    const bTop = fmtParaBorder(paraBorders.top);
    const bBottom = fmtParaBorder(paraBorders.bottom);
    const bLeft = fmtParaBorder(paraBorders.left);
    const bRight = fmtParaBorder(paraBorders.right);
    const padTop = paraBorders.top?.space ? Math.round(paraBorders.top.space * 1.33) : borderPadding;
    const padBottom = paraBorders.bottom?.space ? Math.round(paraBorders.bottom.space * 1.33) : borderPadding;
    if (bTop) { style.borderTop = bTop; style.paddingTop = `${padTop}px`; }
    if (bBottom) { style.borderBottom = bBottom; style.paddingBottom = `${padBottom}px`; }
    if (bLeft) { style.borderLeft = bLeft; style.paddingLeft = `${(leftDxa > 0 ? leftDxa / 15 : 0) + (paraBorders.left?.space ? Math.round(paraBorders.left.space * 1.33) : borderPadding)}px`; }
    if (bRight) { style.borderRight = bRight; style.paddingRight = `${(rightDxa > 0 ? rightDxa / 15 : 0) + (paraBorders.right?.space ? Math.round(paraBorders.right.space * 1.33) : borderPadding)}px`; }
  }

  // ── Page break before ─────────────────────────────────────────────────
  if (paragraph.pageBreakBefore) {
    style.pageBreakBefore = "always";
    (style as any).breakBefore = "page";
  }

  // ── List marker ───────────────────────────────────────────────────────
  const numId = paragraph.numbering?.id || paragraph.numbering?.numId;
  const level = paragraph.numbering?.level ?? paragraph.numbering?.ilvl ?? 0;
  const listInfo = resolveBulletOrNumber(numId, level);

  // ── Runs synthesis ────────────────────────────────────────────────────
  let runs = paragraph.runs;
  if (!runs || runs.length === 0) {
    if (paragraph.text !== undefined || paragraph.drawings) {
      const synthRun: DocxRun = {
        text: paragraph.text || "",
        bold: paragraph.bold,
        italic: paragraph.italic,
        underline: paragraph.underline,
        size: paragraph.size ?? paragraph.fontSize,
        font: paragraph.font,
        color: paragraph.color,
        highlight: paragraph.highlight,
        drawings: paragraph.drawings,
      };
      runs = [synthRun];
    }
  }

  // If paragraph contains a textbox drawing, drop empty whitespace runs to prevent line wrap
  if (hasTextboxDrawing && runs) {
    runs = runs.filter((r) => (r.drawings && r.drawings.length > 0) || (r.text && !/^\s*$/.test(r.text)));
  }

  // ── Heading: apply DOCX style font size/weight ──────────────────────────
  const hLevel = detectHeadingLevel(paragraph.style, styleObj?.name);
  const headingStyle: React.CSSProperties = {};
  if (hLevel !== null) {
    if (!defaultSizeHp) {
      const fallbackSizes: Record<number, string> = {
        0: "26pt",
        1: "14pt",
        2: "13pt",
        3: "12pt",
        4: "11pt",
        5: "11pt",
        6: "11pt",
      };
      headingStyle.fontSize = fallbackSizes[hLevel] ?? "11pt";
    }
    if (effectiveRunDefaults.bold === undefined) {
      headingStyle.fontWeight = "bold";
    }
    if (!spacing?.before && hLevel <= 3) {
      headingStyle.marginTop = hLevel <= 1 ? "12pt" : "8pt";
    }
    if (!spacing?.after && hLevel <= 3) {
      headingStyle.marginBottom = "4pt";
    }
  }

  // ── Empty paragraph ───────────────────────────────────────────────────
  const isEmpty =
    (!runs || runs.length === 0 || runs.every((r) => (!r.text || /^\s*$/.test(r.text)) && (!r.drawings || r.drawings.every((d) => d.isWatermark)) && !r.breaks)) &&
    !paragraph.text;

  if (isEmpty) {
    if (inHeaderFooter) {
      return null;
    }
    const emptyHeight = defaultSizeHp ? `${defaultSizeHp / 2}pt` : "1em";
    return (
      <div
        style={{ ...style, minHeight: emptyHeight, marginBottom: style.marginBottom ?? "0" }}
        aria-hidden="true"
      />
    );
  }

  // ── Header multi-item flex row (e.g. Logo on left, Textbox on right in header1.xml) ──
  const nonWatermarkDrawings = runs?.flatMap((r) => r.drawings || []).filter((d) => !d.isWatermark) || [];
  const hasImageAndTextbox =
    nonWatermarkDrawings.some((d) => !d.textboxContent && (d.relationshipId || d.src)) &&
    nonWatermarkDrawings.some((d) => d.textboxContent && d.textboxContent.length > 0);

  if (hasImageAndTextbox && runs) {
    const txbxRunIndex = runs.findIndex((r) =>
      r.drawings?.some((d) => d.textboxContent && d.textboxContent.length > 0)
    );
    const leftRuns = runs
      .slice(0, txbxRunIndex)
      .filter((r) => (r.drawings && r.drawings.length > 0) || (r.text && !/^\s*$/.test(r.text)));
    const rightRuns = [runs[txbxRunIndex]];

    const flexWidth = leftDxa < 0 ? `calc(100% + ${Math.abs(leftDxa / 15) * 2}px)` : "100%";

    return (
      <div
        style={{
          ...style,
          ...headingStyle,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: flexWidth,
        }}
        className="docx-paragraph docx-flex-row"
      >
        <div className="flex items-center text-left">
          {leftRuns.map((run, idx) => (
            <Run key={`l-${idx}`} run={run} styleDefaults={effectiveRunDefaults} />
          ))}
        </div>
        <div className="flex items-center justify-end text-right">
          {rightRuns.map((run, idx) => (
            <Run key={`r-${idx}`} run={run} styleDefaults={effectiveRunDefaults} />
          ))}
        </div>
      </div>
    );
  }

  // ── Small logo at top of header (flows alongside title text) ───────────
  const isSmallLogoOnly =
    inHeaderFooter &&
    nonWatermarkDrawings.length === 1 &&
    (!runs || runs.every((r) => !r.text || /^\s*$/.test(r.text))) &&
    (nonWatermarkDrawings[0].extent?.cy ? nonWatermarkDrawings[0].extent.cy / 9525 < 60 : true);

  if (isSmallLogoOnly) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
        }}
        className="docx-paragraph docx-small-logo"
      >
        {runs?.map((run, idx) => (
          <Run key={idx} run={run} styleDefaults={effectiveRunDefaults} />
        ))}
      </div>
    );
  }

  // ── Tabbed multi-zone row (e.g. Date on left, Page number on right in footer2.xml) ────
  const hasTabs = runs?.some((r) => r.text && r.text.includes("\t"));
  if (hasTabs && runs) {
    const tabZones = splitRunsByTabs(runs);
    const nonEmptyZones = tabZones.filter((zone) =>
      zone.some(
        (r) =>
          (r.text && !/^\s*$/.test(r.text)) ||
          (r.drawings && r.drawings.some((d) => !d.isWatermark)) ||
          r.field
      )
    );
    if (nonEmptyZones.length >= 2) {
      if (tabZones.length >= 3) {
        // If Zone 1 only has whitespace, and Zone 0 has both text and a floating/centered drawing,
        // move the drawing to Zone 1 (center column) for exact Word alignment (e.g. Daimler logo in footer2.xml)
        const z1HasContent = tabZones[1].some(
          (r) => (r.text && !/^\s*$/.test(r.text)) || (r.drawings && r.drawings.length > 0) || r.field
        );
        if (!z1HasContent) {
          const drawingRunIdx = tabZones[0].findIndex(
            (r) =>
              r.drawings &&
              r.drawings.some(
                (d) =>
                  !d.isWatermark &&
                  (d.positionH?.align === "center" || d.src || d.relationshipId)
              )
          );
          if (drawingRunIdx !== -1 && tabZones[0].length > 1) {
            const [drawingRun] = tabZones[0].splice(drawingRunIdx, 1);
            tabZones[1] = [drawingRun];
          }
        }
      }

      if (tabZones.length === 2) {
        return (
          <div
            style={{
              ...style,
              ...headingStyle,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
            className="docx-paragraph docx-tabbed-row"
          >
            <div className="flex items-center gap-2 text-left">
              {tabZones[0].map((r, i) => (
                <Run key={i} run={r} styleDefaults={effectiveRunDefaults} />
              ))}
            </div>
            <div className="flex items-center justify-end text-right">
              {tabZones[1].map((r, i) => (
                <Run key={i} run={r} styleDefaults={effectiveRunDefaults} />
              ))}
            </div>
          </div>
        );
      } else if (tabZones.length >= 3) {
        return (
          <div
            style={{
              ...style,
              ...headingStyle,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
            className="docx-paragraph docx-tabbed-row"
          >
            <div className="flex items-center gap-2 text-left">
              {tabZones[0].map((r, i) => (
                <Run key={i} run={r} styleDefaults={effectiveRunDefaults} />
              ))}
            </div>
            <div className="flex items-center justify-center text-center">
              {tabZones[1].map((r, i) => (
                <Run key={i} run={r} styleDefaults={effectiveRunDefaults} />
              ))}
            </div>
            <div className="flex items-center justify-end text-right">
              {tabZones[2].map((r, i) => (
                <Run key={i} run={r} styleDefaults={effectiveRunDefaults} />
              ))}
            </div>
          </div>
        );
      }
    }
  }

  return (
    <div
      style={{ ...style, ...headingStyle }}
      className="docx-paragraph"
    >
      {/* Bullet / Number marker */}
      {listInfo.prefix && (
        <span
          className="docx-list-marker inline-block select-none"
          style={{
            fontFamily: listInfo.font
              ? `"${listInfo.font}", Symbol, serif`
              : undefined,
            minWidth: listInfo.isBullet ? "1em" : "1.5em",
            marginRight: "0.25em",
          }}
        >
          {listInfo.prefix}
        </span>
      )}

      {/* Runs — pass effectiveRunDefaults so runs inherit font/size/color */}
      {runs?.map((run, idx) => (
        <Run key={idx} run={run} styleDefaults={effectiveRunDefaults} />
      ))}
    </div>
  );
};
