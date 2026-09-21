import React, { useState, useEffect } from "react";
import {
  X,
  Layers,
  Type,
  Image as ImageIcon,
  Calendar,
  Hash,
  Table as TableIcon,
  Copy,
  Check,
  Trash2,
  Plus,
} from "lucide-react";

export type DynamicFieldType = "text" | "image" | "date" | "number" | "table";

export interface DynamicTableColumn {
  id: string;
  name: string;
  key: string;
  type?: "text" | "number" | "date";
}

export interface DynamicField {
  id: string;
  name: string;
  key: string;
  description: string;
  type: DynamicFieldType;
  value?: string;
  columns?: DynamicTableColumn[];
  color?: string;
}

interface DynamicFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  field?: DynamicField | null;
  onSave: (field: DynamicField) => void;
  onDelete?: (id: string) => void;
}

const FIELD_TYPES: { type: DynamicFieldType; label: string; icon: React.ElementType; description: string }[] = [
  { type: "text", label: "Text", icon: Type, description: "Candidate name, job title, single or multi-line text" },
  { type: "image", label: "Image", icon: ImageIcon, description: "Profile photo, company logo, signature image" },
  { type: "date", label: "Date", icon: Calendar, description: "Joining date, contract expiry, submission date" },
  { type: "number", label: "Number", icon: Hash, description: "Salary, CTC, batch number, percentage, count" },
  { type: "table", label: "Table", icon: TableIcon, description: "Structured multi-row data like compensation or history" },
];

export const DynamicFieldModal: React.FC<DynamicFieldModalProps> = ({
  isOpen,
  onClose,
  field,
  onSave,
  onDelete,
}) => {
  const isEditing = !!field;

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<DynamicFieldType>("text");
  const [columns, setColumns] = useState<DynamicTableColumn[]>([
    { id: "col_1", name: "Description", key: "description", type: "text" },
    { id: "col_2", name: "Amount", key: "amount", type: "number" },
  ]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (field) {
      setName(field.name || "");
      setKey(field.key || "");
      setDescription(field.description || "");
      setType(field.type || "text");
      if (field.columns && field.columns.length > 0) {
        setColumns(field.columns);
      } else {
        setColumns([
          { id: "col_1", name: "Description", key: "description", type: "text" },
          { id: "col_2", name: "Amount", key: "amount", type: "number" },
        ]);
      }
    } else {
      setName("");
      setKey("");
      setDescription("");
      setType("text");
      setColumns([
        { id: "col_1", name: "Description", key: "description", type: "text" },
        { id: "col_2", name: "Amount", key: "amount", type: "number" },
      ]);
    }
  }, [field, isOpen]);

  // Automatically update key when name changes if user hasn't explicitly customized key
  const handleNameChange = (val: string) => {
    setName(val);
    if (!field) {
      const generatedKey = `{{${val.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "")}}}`;
      setKey(generatedKey);
    }
  };

  const handleCopyKey = () => {
    if (!key) return;
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddColumn = () => {
    const nextIdx = columns.length + 1;
    setColumns([
      ...columns,
      {
        id: `col_${Date.now()}_${nextIdx}`,
        name: `Column ${nextIdx}`,
        key: `column_${nextIdx}`,
        type: "text",
      },
    ]);
  };

  const handleUpdateColumn = (id: string, updates: Partial<DynamicTableColumn>) => {
    setColumns(
      columns.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...updates };
        if (updates.name !== undefined && updates.key === undefined) {
          const autoKey = updates.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "");
          if (autoKey) updated.key = autoKey;
        }
        return updated;
      })
    );
  };

  const handleRemoveColumn = (id: string) => {
    if (columns.length <= 1) return;
    setColumns(columns.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const finalKey = key.startsWith("{{") && key.endsWith("}}") ? key : `{{${key.replace(/[{}]/g, "").trim()}}}`;

    const updatedField: DynamicField = {
      id: field?.id || `field_${Date.now()}`,
      name: name.trim(),
      key: finalKey,
      description: description.trim(),
      type,
      columns: type === "table" ? columns : undefined,
      value: field?.value,
      color: type === "image" ? "emerald" : type === "date" ? "orange" : type === "number" ? "blue" : type === "table" ? "indigo" : "purple",
    };

    onSave(updatedField);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {isEditing ? "Edit Dynamic Field" : "Create Dynamic Field"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define dynamic placeholder variable with type and description
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Field Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Field Type:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {FIELD_TYPES.map((t) => {
                const IconComponent = t.icon;
                const isSelected = type === t.type;
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setType(t.type)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mb-1" />
                    <span className="text-xs font-bold capitalize">{t.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {FIELD_TYPES.find((f) => f.type === type)?.description}
            </p>
          </div>

          {/* Name & Key */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Field Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Candidate Photo"
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Template Tag (Key):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="{{candidate_photo}}"
                  className="w-full text-xs font-mono p-2.5 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  title="Copy tag to clipboard"
                  onClick={handleCopyKey}
                  className="absolute right-2 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Table Columns Section - Only shown when Table type is selected */}
          {type === "table" && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-indigo-100 dark:border-indigo-900/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <TableIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Table Columns ({columns.length})
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Add and configure column headers for this dynamic table
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddColumn}
                  className="px-2.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded-lg flex items-center gap-1.5 transition-all shadow-xs hover:border-indigo-300 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Column</span>
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                {columns.map((col, idx) => (
                  <div
                    key={col.id}
                    className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs"
                  >
                    <span className="text-[11px] font-mono font-semibold text-slate-400 w-5 text-center shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => handleUpdateColumn(col.id, { name: e.target.value })}
                        placeholder="Column Name"
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 font-medium"
                      />
                    </div>
                    <div className="w-28 shrink-0">
                      <input
                        type="text"
                        value={col.key}
                        onChange={(e) => handleUpdateColumn(col.id, { key: e.target.value })}
                        placeholder="Column Key"
                        className="w-full text-xs font-mono px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-1 focus:ring-indigo-500 text-slate-600 dark:text-slate-300"
                      />
                    </div>
                    <div className="w-24 shrink-0">
                      <select
                        value={col.type || "text"}
                        onChange={(e) => handleUpdateColumn(col.id, { type: e.target.value as any })}
                        className="w-full text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(col.id)}
                      disabled={columns.length <= 1}
                      title={columns.length <= 1 ? "At least one column is required" : "Delete column"}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-25 disabled:hover:text-slate-400 rounded-md transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {columns.length > 0 && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span>Columns Preview:</span>
                  <div className="flex flex-wrap gap-1 max-w-[70%] justify-end">
                    {columns.map((c) => (
                      <span
                        key={c.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-slate-600 dark:text-slate-300"
                      >
                        {c.name || "Unnamed"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this field is used for and any guidelines..."
              className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-800 dark:text-slate-200 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
          <div>
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (field?.id) onDelete(field.id);
                  onClose();
                }}
                className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-all"
            >
              {isEditing ? "Update Field" : "Save Field"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
