import React, { useState, useCallback, useRef } from "react";
import {
  FileText,
  Upload,
  Braces,
  Eye,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  X,
  RefreshCw,
  ArrowRight,
  Download,
} from "lucide-react";
import { DocxViewer } from "../../shared/ui/DocxViewer";
import {
  docxToJson,
  docxBridgeToJsonString,
  downloadDocxBridgeJson,
  jsonToDocxViewerProps,
} from "../../shared/ui/DocxViewer";
import type { DocxBridgeDocument } from "../../shared/ui/DocxViewer";

// ─── Types ──────────────────────────────────────────────────────────────────
type Tab = "viewer" | "json";

// ─── Component ───────────────────────────────────────────────────────────────
export const DocxBridgeDemo: React.FC = () => {
  const [doc, setDoc] = useState<DocxBridgeDocument | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("viewer");
  const [jsonExpanded, setJsonExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File processing ────────────────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setDoc(null);
    setFileName(file.name);
    try {
      const parsed = await docxToJson(file);
      setDoc(parsed);
      setTab("viewer");
    } catch (err: any) {
      setError(err?.message || "Failed to parse the document.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  // ── JSON panel helpers ─────────────────────────────────────────────────────
  const jsonString = doc ? docxBridgeToJsonString(doc) : "";

  const handleCopyJson = async () => {
    if (!jsonString) return;
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!doc) return;
    const baseName = fileName.replace(/\.(docx|json)$/i, "");
    downloadDocxBridgeJson(doc, `${baseName}.json`);
  };

  // ── JSON re-import ─────────────────────────────────────────────────────────
  const handleJsonInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as DocxBridgeDocument;
      const props = jsonToDocxViewerProps(parsed, { fileName: file.name });
      setDoc(props.data!);
      setFileName(file.name);
      setTab("viewer");
    } catch (err: any) {
      setError("Invalid JSON file: " + (err?.message || "parse error"));
    } finally {
      setLoading(false);
    }
    e.target.value = "";
  };

  const jsonInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm z-20 sticky top-0">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-900/40">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white">
            DocxBridge
          </h1>
          <p className="text-[11px] text-slate-400 leading-none">
            DOCX ↔ JSON · Reusable React Component
          </p>
        </div>

        {/* Flow indicator */}
        <div className="ml-6 hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">.docx</span>
          <ArrowRight className="w-3 h-3" />
          <span className="px-2 py-1 rounded bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 font-mono">JSON</span>
          <ArrowRight className="w-3 h-3" />
          <span className="px-2 py-1 rounded bg-blue-900/50 border border-blue-700/50 text-blue-300 font-mono">&lt;DocxViewer /&gt;</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Re-import JSON button */}
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleJsonInput}
          />
          <button
            type="button"
            onClick={() => jsonInputRef.current?.click()}
            title="Import a docx-bridge JSON file"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-700/60 text-emerald-400 hover:bg-emerald-900/40 transition-colors"
          >
            <Braces className="w-3.5 h-3.5" />
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            className="hidden"
            onChange={handleFileInput}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Open DOCX
          </button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left: Drop zone or Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!doc && !loading && (
            <div
              className={`flex-1 flex flex-col items-center justify-center p-8 m-6 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none ${
                isDragging
                  ? "border-blue-500 bg-blue-900/20"
                  : "border-slate-700 hover:border-slate-500 bg-slate-900/30"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`p-5 rounded-2xl mb-4 transition-all duration-200 ${isDragging ? "bg-blue-600/30 scale-110" : "bg-slate-800"}`}>
                <Upload className={`w-10 h-10 transition-colors ${isDragging ? "text-blue-400" : "text-slate-500"}`} />
              </div>
              <p className="text-base font-semibold text-slate-300 mb-1">
                {isDragging ? "Drop to parse document" : "Drag & drop a .docx file"}
              </p>
              <p className="text-sm text-slate-500">
                or click to browse — supports <code className="text-slate-400">.docx</code> and <code className="text-slate-400">.json</code>
              </p>

              {/* Feature list */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg w-full">
                {[
                  { icon: "📄", label: "Headers & Footers", desc: "Fully rendered" },
                  { icon: "📊", label: "Tables", desc: "With borders & spans" },
                  { icon: "🎨", label: "Rich Typography", desc: "Fonts, colors, styles" },
                ].map((f) => (
                  <div key={f.label} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <div className="text-xs font-semibold text-slate-300">{f.label}</div>
                    <div className="text-[11px] text-slate-500">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Parsing document…</span>
            </div>
          )}

          {error && (
            <div className="m-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800 flex items-start gap-3">
              <X className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-rose-300">Parse Error</p>
                <p className="text-xs text-rose-400 mt-1">{error}</p>
              </div>
              <button
                onClick={() => { setError(null); setDoc(null); setFileName(""); }}
                className="text-rose-400 hover:text-rose-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {doc && !loading && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tab bar */}
              <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-slate-800 bg-slate-900/60">
                {(["viewer", "json"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
                      tab === t
                        ? "text-blue-400 border-blue-500 bg-blue-950/40"
                        : "text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-600"
                    }`}
                  >
                    {t === "viewer" ? <Eye className="w-3.5 h-3.5" /> : <Braces className="w-3.5 h-3.5" />}
                    {t === "viewer" ? "Document Preview" : "Parsed JSON"}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2 pb-1">
                  <span className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">{fileName}</span>
                  {doc && (
                    <button
                      onClick={handleDownloadJson}
                      title="Download JSON"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-900/30 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Viewer tab */}
              {tab === "viewer" && (
                <div className="flex-1 overflow-hidden">
                  <DocxViewer
                    {...jsonToDocxViewerProps(doc, {
                      fileName,
                      showToolbar: true,
                      showJsonExport: true,
                    } as any)}
                    showJsonExport={true}
                    onJsonExport={handleDownloadJson}
                    className="h-full"
                  />
                </div>
              )}

              {/* JSON tab */}
              {tab === "json" && (
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80">
                    <span className="text-[11px] font-mono text-slate-400">
                      {jsonString.split("\n").length.toLocaleString()} lines · {(new Blob([jsonString]).size / 1024).toFixed(1)} KB
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyJson}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          copied
                            ? "bg-emerald-800/60 text-emerald-300"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        }`}
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={handleDownloadJson}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                  </div>
                  <pre className="flex-1 overflow-auto p-4 text-[11px] leading-relaxed font-mono text-slate-300 whitespace-pre">
                    {jsonString}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Info panel (only shown when no document loaded) */}
        {!doc && !loading && (
          <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/50 p-5 flex flex-col gap-4 overflow-y-auto">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                How It Works
              </h2>
              <div className="space-y-3">
                {[
                  {
                    step: "1",
                    title: "Upload .docx",
                    desc: "Drop or select any Word document. The parser uses JSZip to extract the raw XML.",
                    color: "blue",
                  },
                  {
                    step: "2",
                    title: "Convert to JSON",
                    desc: "docxToJson() parses styles, numbering, headers, footers, tables and images into a typed DocxBridgeDocument.",
                    color: "violet",
                  },
                  {
                    step: "3",
                    title: "Render with React",
                    desc: "<DocxViewer data={json} /> renders the document faithfully — margins, borders, typography and all.",
                    color: "emerald",
                  },
                  {
                    step: "4",
                    title: "Re-import JSON",
                    desc: "Any exported JSON file can be fed straight back in — no DOCX needed.",
                    color: "amber",
                  },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 bg-${s.color}-900/50 border border-${s.color}-700/50 text-${s.color}-400`}>
                      {s.step}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-300">{s.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-800" />

            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                Usage
              </h2>
              <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 font-mono text-[10px] text-slate-400 leading-relaxed overflow-x-auto">
                <span className="text-slate-600">// 1. DOCX → JSON</span>{"\n"}
                <span className="text-blue-400">const</span>{" json = "}
                <span className="text-yellow-400">await</span>{" docxToJson(file);\n\n"}
                <span className="text-slate-600">// 2. JSON → Props</span>{"\n"}
                <span className="text-blue-400">const</span>{" props = jsonToDocxViewerProps(json);\n\n"}
                <span className="text-slate-600">// 3. Render</span>{"\n"}
                {"<"}<span className="text-emerald-400">DocxViewer</span>{" {...props} />"}{"\n\n"}
                <span className="text-slate-600">// 4. Export JSON</span>{"\n"}
                {"downloadDocxBridgeJson(json);"}
              </div>
            </div>

            <hr className="border-slate-800" />

            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                Supported Features
              </h2>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                {[
                  "Page layout (A4/Letter/Legal/A3/A5)",
                  "Portrait & Landscape orientation",
                  "Page margins (top/right/bottom/left)",
                  "Headers & Footers",
                  "Paragraphs with alignment & spacing",
                  "Bullet & numbered lists (all formats)",
                  "Tables with colspan / rowspan",
                  "Cell borders & background shading",
                  "Bold / Italic / Underline / Strike",
                  "Font size, family & color",
                  "Text highlight & shading",
                  "Superscript & subscript",
                  "Embedded images (PNG/JPG/SVG)",
                  "Multi-column sections",
                  "Heading styles (H1–H3, Title)",
                  "Full dark mode support",
                  "Zoom / Fullscreen / Print",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-500 text-[9px]">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default DocxBridgeDemo;
