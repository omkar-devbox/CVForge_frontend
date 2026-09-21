/**
 * Resolves font-family with exact metric-compatible fallbacks for web rendering.
 * Matches Microsoft Office fonts with local/web Google fonts:
 * - Calibri -> Carlito (Google's metric-compatible Calibri replacement)
 * - Georgia -> Gelasio (Google's metric-compatible Georgia replacement)
 * - Arial -> Arimo (Google's metric-compatible Arial replacement)
 * - Times New Roman -> Tinos (Google's metric-compatible Times replacement)
 * - Courier New -> Courier, monospace
 */
export function resolveFontFamily(fontName?: string): string {
  if (!fontName) return '"Calibri", "Carlito", system-ui, sans-serif';
  const name = fontName.trim().replace(/^["']|["']$/g, "");
  const lower = name.toLowerCase();

  if (lower.includes("georgia")) {
    return `"${name}", "Gelasio", Georgia, serif`;
  }
  if (lower.includes("times") || lower.includes("roman") || lower.includes("cambria") || lower.includes("garamond")) {
    return `"${name}", "Tinos", "Times New Roman", Times, serif`;
  }
  if (lower.includes("calibri") || lower.includes("carlito")) {
    return `"${name}", "Carlito", Calibri, system-ui, sans-serif`;
  }
  if (lower.includes("arial") || lower.includes("helvetica") || lower.includes("arimo")) {
    return `"${name}", "Arimo", Arial, Helvetica, sans-serif`;
  }
  if (lower.includes("courier") || lower.includes("consolas") || lower.includes("mono")) {
    return `"${name}", "Courier New", Courier, monospace`;
  }
  if (lower.includes("serif")) {
    return `"${name}", "Gelasio", Georgia, serif`;
  }
  return `"${name}", "Carlito", "Calibri", system-ui, sans-serif`;
}
