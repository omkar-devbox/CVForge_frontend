import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ListPlus,
  Type,
  Hash,
  Calendar,
  Settings2,
  Image as ImageIcon,
  Table as TableIcon,
  Copy,
  Check,
  Eye,
  Info,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "@/shared/ui/toast";
import type { TemplateRecord } from "../types/masterWord.types";
import { getTemplateFileUrl } from "../api/masterWordApi";
import { dynamicFieldsApi } from "../api/dynamicFieldsApi";
import { DynamicFieldModal, DynamicField, DynamicFieldType } from "./DynamicFieldModal";
import {
  DocxViewer,
  type DocxSelectionContext,
  type DocxSelectionColumn,
} from "./DocxViewer";

interface MasterWordEditProps {
  template: TemplateRecord;
  onClose: () => void;
  onSave: (updated: Partial<TemplateRecord>) => Promise<void> | void;
  isSaving?: boolean;
}

export const MasterWordEdit: React.FC<MasterWordEditProps> = ({
  template,
  onClose,
  onSave,
  isSaving = false,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "overview">("preview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>(() => {
    if (template.variables && template.variables.length > 0) {
      return template.variables.map((token) => {
        const cleanName = token
          .replace(/[{}]/g, "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        return {
          id: `f_${token.replace(/[^a-zA-Z0-9]/g, "")}`,
          name: cleanName,
          key: token,
          type: "text" as DynamicFieldType,
          description: "Template variable placeholder",
          value: "",
          color: "blue" as const,
        };
      });
    }
    return [];
  });

  // Load saved dynamic fields from backend API on mount
  useEffect(() => {
    if (template.id) {
      dynamicFieldsApi
        .getFieldsByTemplate(template.id)
        .then((backendFields) => {
          if (backendFields && backendFields.length > 0) {
            setDynamicFields(backendFields);
          }
        })
        .catch((err) => {
          console.debug("Remote dynamic fields lookup:", err);
        });
    }
  }, [template.id]);

  const handleSaveAll = async () => {
    const varKeys = dynamicFields.map((f) => f.key);
    try {
      if (template.id && dynamicFields.length > 0) {
        await dynamicFieldsApi.bulkSync(template.id, dynamicFields);
      }
    } catch (err) {
      console.debug("Dynamic fields sync error:", err);
    }
    await onSave({
      templateName: template.templateName,
      description: template.description,
      category: template.category,
      version: template.version,
      status: template.status,
      variables: varKeys,
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<DynamicField | null>(null);

  const handleOpenEditModal = (field: DynamicField) => {
    setSelectedField(field);
    setIsModalOpen(true);
  };

  const handleSaveField = async (savedField: DynamicField) => {
    const isNew =
      !savedField.id ||
      savedField.id.startsWith("field_") ||
      savedField.id.startsWith("f_");

    // Optimistic state update
    setDynamicFields((prev) => {
      const exists = prev.some((f) => f.id === savedField.id || f.key === savedField.key);
      if (exists) {
        return prev.map((f) => (f.id === savedField.id || f.key === savedField.key ? savedField : f));
      } else {
        return [savedField, ...prev];
      }
    });

    // Persist to backend API
    try {
      if (isNew) {
        const created = await dynamicFieldsApi.createDynamicField({
          name: savedField.name,
          key: savedField.key,
          type: savedField.type === "table" ? "COLUMN" : savedField.type.toUpperCase(),
          description: savedField.description,
          templateId: template.id,
          value: savedField.value,
          columns: savedField.columns?.map((c) => ({
            name: c.name,
            key: c.key,
            type: (c.type || "text").toUpperCase(),
          })),
        });
        setDynamicFields((prev) =>
          prev.map((f) => (f.key === savedField.key || f.id === savedField.id ? created : f))
        );
        toast.success(`Dynamic field "${created.name}" created!`);
      } else {
        const updated = await dynamicFieldsApi.updateDynamicField(savedField.id, {
          name: savedField.name,
          key: savedField.key,
          type: savedField.type === "table" ? "COLUMN" : savedField.type.toUpperCase(),
          description: savedField.description,
          value: savedField.value,
          columns: savedField.columns?.map((c) => ({
            name: c.name,
            key: c.key,
            type: (c.type || "text").toUpperCase(),
          })),
        });
        setDynamicFields((prev) =>
          prev.map((f) => (f.id === savedField.id ? updated : f))
        );
        toast.success(`Dynamic field "${updated.name}" updated!`);
      }
    } catch (err: any) {
      console.error("Failed to persist dynamic field:", err);
      toast.error(err?.message || "Failed to persist dynamic field to server");
    }
  };

  const handleDeleteField = async (id: string) => {
    setDynamicFields((prev) => prev.filter((f) => f.id !== id));
    if (id && !id.startsWith("field_") && !id.startsWith("f_")) {
      try {
        await dynamicFieldsApi.deleteDynamicField(id);
        toast.success("Dynamic field deleted!");
      } catch (err: any) {
        console.error("Failed to delete dynamic field from server:", err);
        toast.error(err?.message || "Failed to delete dynamic field");
      }
    }
  };

  // Triggered when user selects text or clicks an image/table in DocxViewer
  const handleTextSelectionAction = (
    selectedText: string,
    _rect?: DOMRect,
    context?: DocxSelectionContext
  ) => {
    // ── 0. Image Detection: when clicking or hovering on an image in the document ──
    if (context?.isImage) {
      const imgName = context.imageName?.trim() || "Company Logo";
      const imgSrc = context.imageSrc || "";
      const cleanImgName = imgName.toLowerCase();
      const cleanImgKey = cleanImgName.replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "");

      // Check if an existing image dynamic field matches
      const existingImage = dynamicFields.find((f) => {
        if (f.type !== "image") return false;
        if (f.value && imgSrc && f.value === imgSrc) return true;
        if (f.name.toLowerCase() === cleanImgName) return true;
        if (cleanImgKey && f.key.replace(/[{}]/g, "").toLowerCase() === cleanImgKey) return true;
        return false;
      });

      if (existingImage) {
        if (!existingImage.value && imgSrc) {
          handleOpenEditModal({ ...existingImage, value: imgSrc });
        } else {
          handleOpenEditModal(existingImage);
        }
        return;
      }

      const generatedKey = `{{${cleanImgKey || "company_logo"}}}`;

      const candidateImageField: DynamicField = {
        id: `field_candidate_${Date.now()}`,
        name: imgName,
        key: generatedKey,
        type: "image",
        value: imgSrc,
        description: `Dynamic graphic placeholder for ${imgName}`,
        color: "emerald",
      };

      setSelectedField(candidateImageField);
      setIsModalOpen(true);
      return;
    }

    const trimmed = selectedText.trim();
    if (!trimmed) return;

    const cleanLower = trimmed.toLowerCase();

    // Check if user selected text that contains a colon or key-value format (e.g. "32. Quotation Reference : As per received...")
    const hasColon = trimmed.includes(":") || trimmed.includes(" - ");
    const isSentence = trimmed.includes(". ") || trimmed.length > 80;

    // ── 1. Table Detection: ONLY when hovering table header or explicitly selecting table header ──
    const isTableAction = Boolean(
      (context?.fromHeaderHover && context?.columns && context.columns.length >= 2) ||
      (context?.isTable && context?.isHeaderRow && !hasColon && !isSentence && context?.columns && context.columns.length >= 2)
    );

    if (isTableAction && context?.columns && context.columns.length >= 2) {
      const extractedCols: DocxSelectionColumn[] = context.columns;

      // Field Name: set to the main header situated above the table!
      let tableName = context.tableName?.trim();
      if (!tableName) {
        const colNamesLower = extractedCols.map((c: DocxSelectionColumn) => c.name.toLowerCase());
        if (colNamesLower.some((n: string) => n.includes("spec") || n.includes("item") || n.includes("equipment"))) {
          tableName = "RFQ Specifications";
        } else if (colNamesLower.some((n: string) => n.includes("price") || n.includes("cost") || n.includes("amount") || n.includes("commercial"))) {
          tableName = "Commercial Details";
        } else {
          tableName = "Table Specifications";
        }
      }

      // Check if an existing table dynamic field matches
      const existingTable = dynamicFields.find((f) => {
        if (f.type !== "table" || !f.columns) return false;

        // Check if field name matches table header above table or selected text
        if (
          (tableName && f.name.toLowerCase() === tableName.toLowerCase()) ||
          f.name.toLowerCase() === cleanLower ||
          f.key.replace(/[{}]/g, "").toLowerCase() === cleanLower
        ) {
          return true;
        }

        // Check if context columns overlap with existing field columns
        if (extractedCols.length > 0) {
          const colMatches = extractedCols.filter((c: DocxSelectionColumn) =>
            f.columns?.some(
              (fc) =>
                fc.name.toLowerCase() === c.name.toLowerCase() ||
                fc.key.toLowerCase() === c.key.toLowerCase()
            )
          );
          if (colMatches.length >= Math.min(2, f.columns.length)) {
            return true;
          }
        }

        return false;
      });

      if (existingTable) {
        handleOpenEditModal(existingTable);
        return;
      }

      // Create a new candidate Table DynamicField using the main header above table as Field Name
      const tableKey = `{{${tableName.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "")}}}`;

      const candidateTableField: DynamicField = {
        id: `field_candidate_${Date.now()}`,
        name: tableName,
        key: tableKey,
        type: "table",
        columns: extractedCols.map((c: DocxSelectionColumn, i: number) => ({
          id: c.id || `col_${Date.now()}_${i + 1}`,
          name: c.name,
          key: c.key || c.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "") || `col_${i + 1}`,
          type: c.type || "text",
        })),
        description: `Dynamic table with ${extractedCols.length} columns (${extractedCols.map((c: DocxSelectionColumn) => c.name).join(", ")})`,
        color: "indigo",
      };

      setSelectedField(candidateTableField);
      setIsModalOpen(true);
      return;
    }

    // ── 2. Scalar Field Parsing (Text, Date, Number, Image) ─────────
    let fieldName = trimmed;
    let fieldValue = trimmed;
    let fieldType: DynamicFieldType = "text";

    if (hasColon) {
      const splitChar = trimmed.includes(":") ? ":" : " - ";
      const firstColonIdx = trimmed.indexOf(splitChar);
      const rawLeft = trimmed.slice(0, firstColonIdx).trim();
      const rawRight = trimmed.slice(firstColonIdx + splitChar.length).trim();

      if (rawLeft && rawRight) {
        // Strip leading numbers like "32. ", "1. ", "a) "
        fieldName = rawLeft.replace(/^[0-9]+(\.[0-9]+)*[.)\s-]+/, "").trim() || rawLeft;
        fieldValue = rawRight;
      }
    } else {
      // Strip leading numbers like "32. ", "1. "
      fieldName = trimmed.replace(/^[0-9]+(\.[0-9]+)*[.)\s-]+/, "").trim() || trimmed;
    }

    // Shorten fieldName if it's too long
    if (fieldName.length > 40) {
      fieldName = fieldName.slice(0, 37) + "...";
    }

    // Check if an existing scalar dynamic field matches
    const cleanNameLower = fieldName.toLowerCase();
    const cleanValueLower = fieldValue.toLowerCase();

    let matched = dynamicFields.find((f) => {
      if (f.type === "table") return false;
      const fVal = f.value?.trim().toLowerCase();
      const fKey = f.key.replace(/[{}]/g, "").trim().toLowerCase();
      const fName = f.name.trim().toLowerCase();

      return (
        (fVal && (fVal === cleanValueLower || cleanValueLower === fVal)) ||
        fKey === cleanNameLower ||
        fName === cleanNameLower
      );
    });

    if (!matched) {
      matched = dynamicFields.find((f) => {
        if (f.type === "table") return false;
        const fVal = f.value?.trim().toLowerCase();
        if (fVal && fVal.length >= 3 && cleanValueLower.includes(fVal)) return true;
        if (fVal && cleanValueLower.length >= 3 && fVal.includes(cleanValueLower)) return true;
        return false;
      });
    }

    if (matched) {
      handleOpenEditModal(matched);
      return;
    }

    // Intelligent type detection
    const dateRegex = /^\d{1,4}[./-]\d{1,2}[./-]\d{2,4}$/;
    const numberRegex = /^\$?\d+([,.]\d+)?%?$/;
    if (dateRegex.test(fieldValue) || dateRegex.test(trimmed)) {
      fieldType = "date";
    } else if (numberRegex.test(fieldValue.replace(/,/g, "")) || numberRegex.test(trimmed.replace(/,/g, ""))) {
      fieldType = "number";
    } else if (
      fieldValue.startsWith("http") &&
      (fieldValue.endsWith(".png") || fieldValue.endsWith(".jpg") || fieldValue.endsWith(".jpeg"))
    ) {
      fieldType = "image";
    }

    const cleanKeyBase = fieldName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/^_+|_+$/g, "");
    const generatedKey = `{{${cleanKeyBase || "custom_field"}}}`;

    const candidateField: DynamicField = {
      id: `field_candidate_${Date.now()}`,
      name: fieldName,
      key: generatedKey,
      type: fieldType,
      value: fieldValue,
      description: `Dynamic placeholder for ${fieldName}`,
      color:
        fieldType === "date"
          ? "amber"
          : fieldType === "number"
            ? "orange"
            : fieldType === "image"
              ? "emerald"
              : "blue",
    };

    setSelectedField(candidateField);
    setIsModalOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return ImageIcon;
      case "date":
        return Calendar;
      case "number":
        return Hash;
      case "table":
        return TableIcon;
      default:
        return Type;
    }
  };

  // Determine document URL from template or backend API
  const getDocumentUrl = () => {
    return getTemplateFileUrl(template.id, template.fileUrl);
  };

  return (
    <div className="flex flex-row h-[calc(100vh-140px)] w-full bg-[#f8f9fa] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden relative font-sans">
      {/* Main Document Workspace Area */}
      <div className="flex-1 h-full flex flex-col min-w-0 bg-[#f0f4f9] dark:bg-[#181a1e] overflow-hidden">
        {/* Workspace Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              title="Back to Templates"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                  {template.templateName}
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {template.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {template.fileName} • {template.category} • {template.version}
              </p>
            </div>
          </div>

          {/* View Mode Toggle Tabs & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "preview"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Document Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "overview"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Template Info</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {isSaving && <Loader2 size={13} className="animate-spin" />}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: docx-preview Document Renderer */}
        {activeTab === "preview" && (
          <div className="flex-1 w-full h-[calc(100%-61px)] overflow-hidden">
            <DocxViewer
              fileUrl={getDocumentUrl()}
              fileName={template.fileName}
              showFileName={false}
              className="h-full"
              onTextSelectionAction={handleTextSelectionAction}
              selectionActionTooltip="Add / Edit Dynamic Field"
            />
          </div>
        )}

        {/* Tab 2: Template Overview & Variable Placeholders */}
        {activeTab === "overview" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center bg-[#f0f4f9] dark:bg-[#181a1e]">
            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 flex flex-col gap-6">
              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                    Author
                  </span>
                  <div className="flex items-center gap-2">
                    <img
                      src={template.authorAvatar}
                      alt={template.author}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {template.author}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                    Version
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {template.version}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                    Dynamic Variables
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {dynamicFields.length} configured
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-950/30">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Template Description & Overview
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {template.description}
                </p>
              </div>

              {/* Dynamic Tokens Cheat Sheet */}
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 bg-blue-50/30 dark:bg-blue-950/10">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Dynamic Variable Placeholders
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  Use the sidebar on the right to manage variables. Click "Copy" on any variable to copy its token (e.g.{" "}
                  <code className="text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-950/60 px-1 py-0.5 rounded">
                    {"{{variable_name}}"}
                  </code>
                  ).
                </p>
                <div className="flex flex-wrap gap-2">
                  {dynamicFields.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleCopyKey(f.key)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors flex items-center gap-1.5 shadow-2xs"
                      title="Click to copy token"
                    >
                      <span>{f.key}</span>
                      {copiedKey === f.key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Dynamic Fields */}
      <div className="w-80 md:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 overflow-hidden">

        {/* Dynamic Fields Section */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-md">
                <ListPlus className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs">Dynamic Fields</span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-semibold">
                {dynamicFields.length}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {dynamicFields.map((field) => {
              const IconComp = getTypeIcon(field.type);

              return (
                <div
                  key={field.id}
                  onClick={() => handleOpenEditModal(field)}
                  className="group border border-slate-200 dark:border-slate-800 rounded-xl p-3 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs transition-all cursor-pointer bg-white dark:bg-slate-950 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-md">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          {field.name}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400">
                          {field.key}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {field.type}
                      </span>
                      <button
                        type="button"
                        title="Edit Field"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(field);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 transition-colors"
                      >
                        <Settings2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {field.description && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 line-clamp-1">
                      {field.description}
                    </p>
                  )}

                  {field.type === "table" && field.columns && field.columns.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 mb-1">
                      {field.columns.map((c) => (
                        <span
                          key={c.id}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 font-mono"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {field.type === "image" && field.value && (
                    <div className="mt-2 mb-1 flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={field.value}
                          alt={field.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {field.value.startsWith("blob:") || field.value.startsWith("data:")
                          ? "Embedded Graphic Part"
                          : field.value}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium flex-1">
                      {field.value || <span className="text-slate-400 font-mono text-[10px]">{field.key}</span>}
                    </p>
                    <button
                      type="button"
                      title={`Copy ${field.key} token`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyKey(field.key);
                      }}
                      className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded transition-all flex items-center gap-1 shadow-2xs"
                    >
                      {copiedKey === field.key ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>


        </div>
      </div>

      {/* Dynamic Field Modal */}
      <DynamicFieldModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        field={selectedField}
        isExisting={selectedField ? dynamicFields.some((f) => f.id === selectedField.id) : false}
        onSave={handleSaveField}
        onDelete={handleDeleteField}
      />
    </div>
  );
};
