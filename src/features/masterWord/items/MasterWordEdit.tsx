import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  ListPlus,
  Type,
  Hash,
  Calendar,
  Settings2,
  Plus,
  Image as ImageIcon,
  Table as TableIcon,
  Loader2,
  FileText,
  Copy,
  Check,
  Eye,
  Info,
  ArrowLeft,
} from "lucide-react";
import type { TemplateRecord } from "../types/masterWord.types";
import { DynamicFieldModal, DynamicField } from "./DynamicFieldModal";
import { DocxViewer } from "./DocxViewer";

interface MasterWordEditProps {
  template: TemplateRecord;
  onClose: () => void;
  onSave: () => void;
}

const INITIAL_FIELDS: DynamicField[] = [
  {
    id: "f_quotation_no",
    name: "Quotation Number",
    key: "{{quotation_no}}",
    type: "text",
    description: "Official quotation reference number",
    value: "Q-2026-019-R0",
    color: "blue",
  },
  {
    id: "f_quotation_date",
    name: "Quotation Date",
    key: "{{quotation_date}}",
    type: "date",
    description: "Date of quotation release",
    value: "12.03.2026",
    color: "amber",
  },
  {
    id: "f_client_attn",
    name: "Client Attention",
    key: "{{client_attn}}",
    type: "text",
    description: "Name of the client contact person",
    value: "Mr. Avinash Gonge",
    color: "purple",
  },
  {
    id: "f_project_title",
    name: "Project Title",
    key: "{{project_title}}",
    type: "text",
    description: "Name of the conveyor project",
    value: "Engine conveyor along with engine pallets",
    color: "emerald",
  },
  {
    id: "f_contact_person",
    name: "Contact Person",
    key: "{{contact_person}}",
    type: "text",
    description: "Primary representative name",
    value: "Vijay Shete",
    color: "indigo",
  },
  {
    id: "f_contact_email",
    name: "Contact Email",
    key: "{{contact_email}}",
    type: "text",
    description: "Email address for RFQ communications",
    value: "vijayshete@prologicmechatronics.com",
    color: "blue",
  },
  {
    id: "f_contact_mobile",
    name: "Contact Phone",
    key: "{{contact_phone}}",
    type: "number",
    description: "Mobile number for project coordinator",
    value: "7558222587",
    color: "orange",
  },
  {
    id: "f_specs_table",
    name: "RFQ Specifications",
    key: "{{rfq_specifications}}",
    type: "table",
    description: "Equipment and conveyor specification line items",
    color: "indigo",
    columns: [
      { id: "c1", name: "Item", key: "item", type: "text" },
      { id: "c2", name: "Description", key: "description", type: "text" },
      { id: "c3", name: "Quantity", key: "qty", type: "text" },
    ],
  },
];

export const MasterWordEdit: React.FC<MasterWordEditProps> = ({ template, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<"preview" | "overview">("preview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>(INITIAL_FIELDS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<DynamicField | null>(null);

  // Top AI Assistant input
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const handleOpenCreateModal = () => {
    setSelectedField(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (field: DynamicField) => {
    setSelectedField(field);
    setIsModalOpen(true);
  };

  const handleSaveField = (savedField: DynamicField) => {
    setDynamicFields((prev) => {
      const exists = prev.some((f) => f.id === savedField.id);
      if (exists) {
        return prev.map((f) => (f.id === savedField.id ? savedField : f));
      } else {
        return [savedField, ...prev];
      }
    });
  };

  const handleDeleteField = (id: string) => {
    setDynamicFields((prev) => prev.filter((f) => f.id !== id));
  };

  // Quick AI Assistant action at top of sidebar
  const handleTopAiSubmit = () => {
    if (!aiAssistantPrompt.trim()) return;
    setIsAiProcessing(true);

    setTimeout(() => {
      setIsAiProcessing(false);
      const prompt = aiAssistantPrompt.toLowerCase();
      const isPhoto = prompt.includes("photo") || prompt.includes("image");
      const isDate = prompt.includes("date");
      const isNumber = prompt.includes("salary") || prompt.includes("amount") || prompt.includes("number");

      const newField: DynamicField = {
        id: `field_${Date.now()}`,
        name: isPhoto
          ? "Candidate Photograph"
          : isDate
            ? "Joining Date"
            : isNumber
              ? "Expected Salary"
              : "Candidate Experience",
        key: isPhoto
          ? "{{candidate_photograph}}"
          : isDate
            ? "{{joining_date}}"
            : isNumber
              ? "{{expected_salary}}"
              : "{{candidate_experience}}",
        type: isPhoto ? "image" : isDate ? "date" : isNumber ? "number" : "text",
        description: isPhoto
          ? "Uploaded formal passport photo"
          : "AI generated dynamic template field",
        value: isPhoto
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
          : "Standard Value",
        color: isPhoto ? "emerald" : "blue",
      };
      handleSaveField(newField);
      handleOpenEditModal(newField);
      setAiAssistantPrompt("");
    }, 800);
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

  // Determine initial document URL based on template
  const getDocumentUrl = () => {
    if (template.fileName.includes("Engine dressing conveyor") || template.id === "1") {
      return "/documents/conveyor.docx";
    }
    if (template.fileName === "sample.docx") {
      return "/sample.docx";
    }
    return `/documents/${template.fileName}`;
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
              onClick={onSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Tab 1: docx-preview Document Renderer */}
        {activeTab === "preview" && (
          <div className="flex-1 w-full h-[calc(100%-61px)] overflow-hidden">
            <DocxViewer
              fileUrl={getDocumentUrl()}
              fileName={template.fileName}
              className="h-full"
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

      {/* Right Sidebar - Dynamic Fields & AI */}
      <div className="w-80 md:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 overflow-hidden">
        {/* AI Feature Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white dark:from-indigo-900/20 dark:via-blue-900/10 dark:to-slate-900 relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Bot size={70} />
          </div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1 relative z-10">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs">AI Assistant</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 relative z-10">
            Prompt AI to create template variables automatically.
          </p>
          <div className="relative z-10">
            <textarea
              value={aiAssistantPrompt}
              onChange={(e) => setAiAssistantPrompt(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-indigo-100 dark:border-indigo-900/50 rounded-lg text-xs p-2.5 pr-8 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none h-16 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 shadow-2xs"
              placeholder="e.g. Create photo field or expected salary..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleTopAiSubmit();
                }
              }}
            />
            <button
              type="button"
              onClick={handleTopAiSubmit}
              disabled={isAiProcessing || !aiAssistantPrompt.trim()}
              className="absolute bottom-2.5 right-2 text-white bg-indigo-600 hover:bg-indigo-700 p-1 rounded-md transition-all shadow-sm disabled:opacity-50"
            >
              {isAiProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

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
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="text-[11px] font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-600 border border-blue-200 dark:border-blue-800/50 hover:border-transparent px-2 py-1 rounded-md transition-all flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3 h-3" /> Add Field
            </button>
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

          {/* Add Field Dropzone */}
          <div className="mt-3">
            <div
              onClick={handleOpenCreateModal}
              className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/60 dark:to-slate-800/30 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/60 border-dashed text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group"
            >
              <div className="w-6 h-6 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-1.5 shadow-2xs group-hover:scale-110 transition-transform">
                <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                Add Dynamic Field
              </p>
              <span className="text-[9px] text-slate-400 block">
                Text, Image, Date, Number, Table
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Field Modal */}
      <DynamicFieldModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        field={selectedField}
        onSave={handleSaveField}
        onDelete={handleDeleteField}
      />
    </div>
  );
};
