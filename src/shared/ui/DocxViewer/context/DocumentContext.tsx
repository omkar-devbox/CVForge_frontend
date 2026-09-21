import React, { createContext, useContext, useMemo, useRef } from "react";
import type {
  DocxBridgeDocument,
  DocxStyle,
  DocxHeaderFooter,
  DocxNumberingData,
} from "../types/docxBridge.types";

interface DocumentContextValue {
  styles: Record<string, DocxStyle>;
  numbering?: DocxNumberingData | any;
  relations: Record<string, string>;
  media: Record<string, string>;
  headers: Record<string, DocxHeaderFooter>;
  footers: Record<string, DocxHeaderFooter>;
  resolveBulletOrNumber: (
    numId?: number | string,
    level?: number
  ) => { prefix: string; font?: string; isBullet?: boolean };
  resolveStyle: (styleId?: string) => DocxStyle | undefined;
  resolveMediaSrc: (rIdOrTarget?: string) => string | undefined;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

export interface DocumentProviderProps {
  document: DocxBridgeDocument;
  children: React.ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({
  document,
  children,
}) => {
  // Normalize styles into dictionary
  const stylesMap = useMemo(() => {
    const map: Record<string, DocxStyle> = {};
    if (!document.styles) return map;
    if (Array.isArray(document.styles)) {
      for (const s of document.styles) {
        if (s && s.id) map[s.id] = s;
      }
    } else if (typeof document.styles === "object") {
      Object.assign(map, document.styles);
    }
    return map;
  }, [document.styles]);

  // Normalize relations
  const relationsMap = useMemo(() => {
    const map: Record<string, string> = {};
    const rels = document.relations || document.relationships;
    if (!rels) return map;
    if (Array.isArray(rels)) {
      for (const r of rels) {
        if (r && r.id) map[r.id] = r.target;
      }
    } else if (typeof rels === "object") {
      Object.assign(map, rels);
    }
    return map;
  }, [document.relations, document.relationships]);

  // Normalize headers
  const headersMap = useMemo(() => {
    const map: Record<string, DocxHeaderFooter> = {};
    if (!document.headers) return map;
    if (Array.isArray(document.headers)) {
      document.headers.forEach((h, idx) => {
        const id = h.id || `header_${idx + 1}`;
        map[id] = h;
      });
    } else if (typeof document.headers === "object") {
      Object.assign(map, document.headers);
    }
    return map;
  }, [document.headers]);

  // Normalize footers
  const footersMap = useMemo(() => {
    const map: Record<string, DocxHeaderFooter> = {};
    if (!document.footers) return map;
    if (Array.isArray(document.footers)) {
      document.footers.forEach((f, idx) => {
        const id = f.id || `footer_${idx + 1}`;
        map[id] = f;
      });
    } else if (typeof document.footers === "object") {
      Object.assign(map, document.footers);
    }
    return map;
  }, [document.footers]);

  const mediaMap = useMemo(() => document.media || {}, [document.media]);

  // Sequential counter tracker for numbered lists
  const listCounters = useRef<Record<string, number>>({});

  const resolveStyle = (styleId?: string): DocxStyle | undefined => {
    if (!styleId) return undefined;
    return stylesMap[styleId];
  };

  const resolveMediaSrc = (rIdOrTarget?: string): string | undefined => {
    if (!rIdOrTarget) return undefined;

    // Already a data URL, blob, or absolute web URL
    if (
      rIdOrTarget.startsWith("data:") ||
      rIdOrTarget.startsWith("blob:") ||
      rIdOrTarget.startsWith("http://") ||
      rIdOrTarget.startsWith("https://")
    ) {
      return rIdOrTarget;
    }

    // Direct check in mediaMap
    if (mediaMap[rIdOrTarget]) return mediaMap[rIdOrTarget];

    // Check relationship target
    const target = relationsMap[rIdOrTarget];
    if (target) {
      if (mediaMap[target]) return mediaMap[target];
      const strippedTarget = target.replace(/^word\//, "").replace(/^\/+/, "");
      if (mediaMap[strippedTarget]) return mediaMap[strippedTarget];
      const filename = target.split("/").pop();
      if (filename && mediaMap[filename]) return mediaMap[filename];
      // Do not return XML files as image src
      if (target.endsWith(".xml") || target.endsWith(".rels")) return undefined;
      return target;
    }

    // Try filename lookup
    const filename = rIdOrTarget.split("/").pop();
    if (filename && mediaMap[filename]) return mediaMap[filename];

    const stripped = rIdOrTarget.replace(/^word\//, "").replace(/^\/+/, "");
    if (mediaMap[stripped]) return mediaMap[stripped];

    if (rIdOrTarget.endsWith(".xml") || rIdOrTarget.endsWith(".rels")) return undefined;
    return rIdOrTarget;
  };

  const resolveBulletOrNumber = (
    numId?: number | string,
    level: number = 0
  ): { prefix: string; font?: string; isBullet?: boolean } => {
    if (numId === undefined || numId === null || numId === "") {
      return { prefix: "" };
    }

    const numbering = document.numbering as any;
    if (!numbering) {
      // Default fallback
      return { prefix: "•", isBullet: true };
    }

    // Find abstractNumId from num instance
    let abstractNumId: number | string | undefined;
    if (Array.isArray(numbering.nums)) {
      const numInst = numbering.nums.find(
        (n: any) => String(n.id) === String(numId) || String(n.numId) === String(numId)
      );
      if (numInst) abstractNumId = numInst.abstractNumId;
    } else if (Array.isArray(numbering)) {
      const found = numbering.find(
        (n: any) => String(n.id) === String(numId) || String(n.numId) === String(numId)
      );
      if (found) abstractNumId = found.abstractNumId || found.id;
    }

    if (abstractNumId === undefined) {
      abstractNumId = numId;
    }

    // Find abstractNum definition
    let abstractDef: any;
    if (Array.isArray(numbering.abstractNums)) {
      abstractDef = numbering.abstractNums.find(
        (a: any) =>
          String(a.id) === String(abstractNumId) ||
          String(a.abstractNumId) === String(abstractNumId)
      );
    } else if (Array.isArray(numbering)) {
      abstractDef = numbering.find(
        (a: any) =>
          String(a.id) === String(abstractNumId) ||
          String(a.abstractNumId) === String(abstractNumId)
      );
    }

    let lvlDef: any;
    if (abstractDef && abstractDef.levels) {
      if (Array.isArray(abstractDef.levels)) {
        lvlDef =
          abstractDef.levels.find((l: any) => Number(l.level) === level) ||
          abstractDef.levels[level];
      } else if (typeof abstractDef.levels === "object") {
        lvlDef = abstractDef.levels[level];
      }
    }

    if (!lvlDef) {
      // Fallback
      return { prefix: "•", isBullet: true };
    }

    const numFmt = lvlDef.format || "bullet";
    const lvlText = lvlDef.text || lvlDef.bullet || lvlDef.symbol || "•";
    const font = lvlDef.font;

    if (numFmt === "bullet") {
      // Special symbol mapping
      let symbolChar = lvlText;
      if (symbolChar.startsWith("%")) symbolChar = "•";
      return { prefix: symbolChar, font, isBullet: true };
    }

    // Numbered list counter
    const counterKey = `${numId}_${level}`;
    const startVal = lvlDef.start !== undefined ? Number(lvlDef.start) : 1;
    const currentVal =
      listCounters.current[counterKey] !== undefined
        ? listCounters.current[counterKey] + 1
        : startVal;
    listCounters.current[counterKey] = currentVal;

    let formattedNumber = String(currentVal);
    if (numFmt === "decimal") {
      formattedNumber = String(currentVal);
    } else if (numFmt === "lowerLetter") {
      formattedNumber = String.fromCharCode(96 + ((currentVal - 1) % 26) + 1);
    } else if (numFmt === "upperLetter") {
      formattedNumber = String.fromCharCode(64 + ((currentVal - 1) % 26) + 1);
    } else if (numFmt === "lowerRoman") {
      const romans = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
      formattedNumber = romans[(currentVal - 1) % 10] || String(currentVal);
    } else if (numFmt === "upperRoman") {
      const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
      formattedNumber = romans[(currentVal - 1) % 10] || String(currentVal);
    }

    const prefix = lvlText.includes("%")
      ? lvlText.replace(/%\d/g, formattedNumber)
      : `${formattedNumber}.`;

    return { prefix, font, isBullet: false };
  };

  return (
    <DocumentContext.Provider
      value={{
        styles: stylesMap,
        numbering: document.numbering,
        relations: relationsMap,
        media: mediaMap,
        headers: headersMap,
        footers: footersMap,
        resolveBulletOrNumber,
        resolveStyle,
        resolveMediaSrc,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = (): DocumentContextValue => {
  const ctx = useContext(DocumentContext);
  if (!ctx) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return ctx;
};
