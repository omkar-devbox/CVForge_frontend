import React from "react";
import type { DocxRun, DocxDrawing, DocxParagraph } from "../types/docxBridge.types";
import { Paragraph } from "./Paragraph";
import { useDocument } from "../context/DocumentContext";
import { usePage } from "../context/PageContext";
import { resolveFontFamily } from "../utils/fontUtils";

interface RunProps {
  run: DocxRun;
  /** Inherited run defaults from the paragraph's style chain (font, size, color, bold, italic) */
  styleDefaults?: Partial<DocxRun>;
}

export const Run: React.FC<RunProps> = ({ run, styleDefaults = {} }) => {
  const { resolveMediaSrc } = useDocument();

  // ── Breaks ────────────────────────────────────────────────────────────
  if (run.breaks && run.breaks.length > 0) {
    return (
      <>
        {run.breaks.map((b, idx) => {
          if (b.type === "page") {
            // Page breaks are handled by pagination in DocxViewer; do not draw unnecessary divider lines
            return null;
          }
          return <br key={idx} />;
        })}
      </>
    );
  }

  // ── Drawings / Images ─────────────────────────────────────────────────
  if (run.drawings && run.drawings.length > 0) {
    const isCentered = run.drawings.some((d) => d.positionH?.align === "center");
    const isRight = run.drawings.some((d) => d.positionH?.align === "right");
    const hasTextbox = run.drawings.some((d) => d.textboxContent && d.textboxContent.length > 0);
    return (
      <span
        className={`align-middle ${
          hasTextbox
            ? "block text-left w-full m-0 p-0"
            : isCentered
            ? "block text-center w-full my-1"
            : isRight
            ? "block text-right w-full my-1"
            : "inline-block my-1"
        }`}
      >
        {run.drawings.map((drawing, idx) => (
          <DrawingItem key={idx} drawing={drawing} resolveMediaSrc={resolveMediaSrc} />
        ))}
      </span>
    );
  }

  const { pageNumber, totalPages } = usePage();

  // ── Pure text run or dynamic field ────────────────────────────────────
  let text = run.text ?? "";
  if (run.field === "PAGE") {
    text = String(pageNumber);
  } else if (run.field === "NUMPAGES") {
    text = String(totalPages);
  }
  if (!text) return null;

  const style: React.CSSProperties = {};

  // Font weight / style — run explicit overrides style defaults
  const effectiveBold = run.bold ?? run.boldCs ?? styleDefaults.bold;
  const effectiveItalic = run.italic ?? run.italicCs ?? styleDefaults.italic;
  if (effectiveBold) style.fontWeight = "bold";
  if (effectiveItalic) style.fontStyle = "italic";

  // Text decoration
  if (run.underline) {
    style.textDecoration = "underline";
  } else if (run.strike || run.doubleStrike) {
    style.textDecoration = "line-through";
    if (run.doubleStrike) style.textDecorationStyle = "double";
  }

  // Font size: OOXML stores in half-points (e.g. 24 → 12pt)
  // Run explicit → style default
  const sizeHp = run.size ?? run.fontSize ?? run.fontSizeCs ?? styleDefaults.size ?? styleDefaults.fontSize;
  if (sizeHp) style.fontSize = `${sizeHp / 2}pt`;

  // Font family — run explicit → style default
  const fontFamily =
    run.font ??
    run.fonts?.ascii ??
    run.fonts?.hAnsi ??
    run.fonts?.cs ??
    styleDefaults.font ??
    styleDefaults.fonts?.ascii ??
    styleDefaults.fonts?.hAnsi;
  if (fontFamily) {
    style.fontFamily = resolveFontFamily(fontFamily);
  }

  // Color — run explicit → style default (skip "auto")
  const effectiveColor = run.color ?? styleDefaults.color;
  if (effectiveColor && effectiveColor !== "auto") {
    style.color = effectiveColor.startsWith("#") ? effectiveColor : `#${effectiveColor}`;
  }

  // Highlight (named color → hex)
  if (run.highlight && run.highlight !== "none") {
    style.backgroundColor = getHighlightColor(run.highlight);
  }

  // Shading fill (background color on the run)
  if (run.shading) {
    const fill = typeof run.shading === "object" ? run.shading.fill : run.shading;
    if (fill && fill !== "auto" && fill !== "none") {
      style.backgroundColor = fill.startsWith("#") ? fill : `#${fill}`;
    }
  }

  // Tab stops — set a sensible tab width (~0.5 inch at 96 DPI)
  const hasTabs = text.includes("\t");
  if (hasTabs) {
    (style as any).tabSize = "40px";
    style.whiteSpace = "pre-wrap";
  }

  // Superscript / subscript
  if (run.vertAlign === "superscript") {
    return <sup style={style}>{text}</sup>;
  }
  if (run.vertAlign === "subscript") {
    return <sub style={style}>{text}</sub>;
  }

  return (
    <span style={style} className="docx-run whitespace-pre-wrap">
      {text}
    </span>
  );
};

// ─── Drawing / Image renderer ─────────────────────────────────────────────────

const DrawingItem: React.FC<{
  drawing: DocxDrawing;
  resolveMediaSrc: (id?: string) => string | undefined;
}> = ({ drawing, resolveMediaSrc }) => {
  // 1. Watermark image: rendered at page sheet level in Section.tsx
  if (drawing.isWatermark) {
    return null;
  }

  // EMU → px  (914,400 EMU = 1 inch = 96 px → 1 px = 9525 EMU)
  const wEmu = drawing.extent?.cx ?? drawing.extent?.width;
  const hEmu = drawing.extent?.cy ?? drawing.extent?.height;
  const widthPx = wEmu ? Math.round(wEmu / 9525) : undefined;
  const heightPx = hEmu ? Math.round(hEmu / 9525) : undefined;

  // 2. Text box content inside drawing (wps:txbx / w:txbxContent)
  if (drawing.textboxContent && drawing.textboxContent.length > 0) {
    const activeParas = drawing.textboxContent.filter((p) => {
      const txt = p.text || p.runs?.map((r) => r.text || "").join("");
      return txt && !/^\s*$/.test(txt);
    });

    const hasBorder = Boolean(
      drawing.borderColor &&
        drawing.borderColor !== "none" &&
        drawing.borderColor !== "transparent" &&
        drawing.borderColor !== "auto"
    );

    const borderColor = hasBorder
      ? drawing.borderColor!.startsWith("#")
        ? drawing.borderColor
        : `#${drawing.borderColor}`
      : undefined;

    return (
      <div
        className="docx-textbox-drawing inline-flex flex-col justify-center text-left align-middle bg-transparent text-slate-900 dark:text-slate-100 shadow-none rounded-none"
        style={{
          minWidth: widthPx ? `${widthPx}px` : undefined,
          width: "fit-content",
          minHeight: heightPx ? `${heightPx}px` : undefined,
          maxWidth: "100%",
          boxSizing: "border-box",
          border: hasBorder
            ? `${drawing.borderWidth ?? 1}px ${drawing.borderStyle ?? "solid"} ${borderColor}`
            : "none",
          backgroundColor:
            drawing.fillColor && drawing.fillColor !== "none"
              ? drawing.fillColor.startsWith("#")
                ? drawing.fillColor
                : `#${drawing.fillColor}`
              : "transparent",
          padding: hasBorder ? "4px 8px" : "0px",
        }}
      >
        {activeParas.map((p, idx) => {
          // Clean leading indentation whitespace so address lines align flush with company name
          const cleanedRuns = p.runs?.map((r, rIdx) => {
            if (rIdx === 0 && r.text) {
              return { ...r, text: r.text.replace(/^\s+/, "") };
            }
            return r;
          });
          const cleanedP: DocxParagraph = {
            ...p,
            text: p.text?.replace(/^\s+/, ""),
            runs: cleanedRuns,
          };
          return <Paragraph key={idx} paragraph={cleanedP} inHeaderFooter={true} />;
        })}
      </div>
    );
  }

  const rawSrc = drawing.src || drawing.relationshipId;
  const src = resolveMediaSrc(rawSrc);
  if (!src) return null;

  const imgStyle: React.CSSProperties = {
    maxWidth: "100%",
    height: "auto",
    display: "inline-block",
  };
  if (widthPx) imgStyle.width = `${widthPx}px`;
  if (heightPx) imgStyle.maxHeight = `${heightPx}px`;

  return (
    <img
      src={src}
      alt={drawing.name || "Embedded Document Graphic"}
      style={imgStyle}
      className="inline-block"
      loading="eager"
    />
  );
};

// ─── Highlight name → hex ─────────────────────────────────────────────────────

function getHighlightColor(colorName: string): string {
  const map: Record<string, string> = {
    yellow: "#ffff00",
    green: "#00ff00",
    cyan: "#00ffff",
    magenta: "#ff00ff",
    blue: "#0000ff",
    red: "#ff0000",
    darkBlue: "#000080",
    darkCyan: "#008080",
    darkGreen: "#008000",
    darkMagenta: "#800080",
    darkRed: "#800000",
    darkYellow: "#808000",
    darkGray: "#808080",
    lightGray: "#d3d3d3",
    black: "#000000",
    white: "#ffffff",
    none: "transparent",
  };
  return map[colorName] || colorName;
}
