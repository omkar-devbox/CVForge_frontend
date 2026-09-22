import React, { useState, useEffect, useCallback } from "react";
import { Page } from "@/shared/pages/Page/Page";
import { Button } from "@/shared/ui/button";
import {
  Plus,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/shared/ui/Modal";
import { MasterWordForm } from "./items/MasterWordForm";
import { MasterWordTable } from "./items/MasterWordTable";
import { MasterWordEdit } from "./items/MasterWordEdit";
import { masterWordApi } from "./api/masterWordApi";
import type {
  MasterWordFormValues,
  TemplateRecord,
  TemplateFilters,
} from "./types/masterWord.types";

export const MasterWordPage: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View & Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Action states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<TemplateRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Fetch templates from backend API
  const fetchTemplates = useCallback(
    async (filters?: TemplateFilters, isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const data = await masterWordApi.getTemplates(filters);
        setTemplates(data);
      } catch (err: any) {
        const errorMsg =
          err?.message || "Failed to load master word templates from server.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Debounced search / filter update
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: TemplateFilters = {};
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (selectedCategory !== "ALL") filters.category = selectedCategory;
      if (selectedStatus !== "ALL") filters.status = selectedStatus;

      fetchTemplates(filters);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedStatus, fetchTemplates]);

  // Handle template creation with live file upload
  const handleCreateSubmit = async (data: MasterWordFormValues) => {
    if (!data.file) {
      toast.error("Please attach a .docx document.");
      return;
    }

    try {
      setIsCreating(true);
      const newRecord = await masterWordApi.createTemplate({
        templateName: data.templateName,
        description: data.description || "",
        file: data.file,
        category: data.category || "GENERAL",
        author: data.author || "Admin User",
        version: data.version || "v1.0",
      });

      setTemplates((prev) => [newRecord, ...prev]);
      setIsFormOpen(false);
      toast.success(
        `Template "${newRecord.templateName}" uploaded and created successfully!`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload and create template.");
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  // Open edit mode
  const handleEdit = (template: TemplateRecord) => {
    setEditingTemplate(template);
  };

  const handleCloseEdit = () => {
    setEditingTemplate(null);
  };

  // Save template edits to backend
  const handleSaveEdit = async (updated: Partial<TemplateRecord>) => {
    if (!editingTemplate) return;

    try {
      setIsSaving(true);
      const saved = await masterWordApi.updateTemplate(editingTemplate.id, {
        templateName: updated.templateName,
        description: updated.description,
        category: updated.category,
        version: updated.version,
        status: updated.status,
        variables: updated.variables,
        isJsonSchemaValid: updated.isJsonSchemaValid,
      });

      setTemplates((prev) =>
        prev.map((t) => (t.id === saved.id ? saved : t))
      );
      setEditingTemplate(null);
      toast.success(`Template "${saved.templateName}" updated successfully!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save template changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Download template docx file from backend
  const handleDownload = async (template: TemplateRecord) => {
    try {
      setDownloadingId(template.id);
      await masterWordApi.downloadTemplate(template.id, template.fileName);
      toast.success(`Downloaded ${template.fileName}`);
    } catch (err: any) {
      toast.error(err?.message || `Failed to download ${template.fileName}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // Trigger delete confirmation modal
  const handleDeleteRequest = (template: TemplateRecord) => {
    setDeletingTemplate(template);
  };

  // Confirm delete on backend
  const handleConfirmDelete = async () => {
    if (!deletingTemplate) return;

    try {
      setIsDeleting(true);
      await masterWordApi.deleteTemplate(deletingTemplate.id);
      setTemplates((prev) => prev.filter((t) => t.id !== deletingTemplate.id));
      toast.success(`Template "${deletingTemplate.templateName}" deleted.`);
      setDeletingTemplate(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete template.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Extract unique categories for filter dropdown/chips
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [templates]);

  return (
    <Page
      title={
        editingTemplate
          ? `Edit: ${editingTemplate.templateName}`
          : "Master Word Templates"
      }
      subtitle={
        editingTemplate
          ? "Inspect document structure, preview content, and configure dynamic variable tags."
          : "View, upload, download, and manage your master .docx word templates."
      }
      breadcrumbs={[
        { label: "Home", path: "/master-word" },
        { label: "Master Word", path: "/master-word" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          {!isFormOpen && !editingTemplate && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTemplates(undefined, true)}
                disabled={isRefreshing || isLoading}
                title="Refresh templates"
                className="gap-1.5 text-xs h-9"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin text-blue-600" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsFormOpen(true)}
                className="gap-2 text-xs h-9"
              >
                <Plus size={16} />
                Add Template
              </Button>
            </>
          )}
          {editingTemplate && (
            <Button variant="outline" size="sm" onClick={handleCloseEdit}>
              Discard
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col w-full h-full">
        {/* Create Form Drawer/Block */}
        {isFormOpen && (
          <MasterWordForm
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleCreateSubmit}
            isSubmitting={isCreating}
          />
        )}

        {/* Edit Workspace */}
        {editingTemplate && (
          <MasterWordEdit
            template={editingTemplate}
            onClose={handleCloseEdit}
            onSave={handleSaveEdit}
            isSaving={isSaving}
          />
        )}

        {/* Master Word Table View */}
        {!isFormOpen && !editingTemplate && (
          <div className="flex-1 w-full flex flex-col min-h-0">
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md relative">
                <Search
                  size={16}
                  className="absolute left-3 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates by name, file, or description..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Category Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Filter size={13} />
                  <span>Category:</span>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active Production">Active Production</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Restricted Access">Restricted Access</option>
                </select>
              </div>
            </div>

            {/* Error Banner */}
            {error && !isLoading && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-center justify-between text-red-700 dark:text-red-300">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTemplates()}
                  className="text-xs h-8 bg-white dark:bg-slate-900 border-red-300 dark:border-red-800"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Table Content */}
            <div className="flex-1 w-full relative">
              <MasterWordTable
                data={templates}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDownload={handleDownload}
                onDelete={handleDeleteRequest}
                downloadingId={downloadingId}
                deletingId={deletingTemplate?.id}
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingTemplate && (
        <Modal
          open={true}
          onClose={() => !isDeleting && setDeletingTemplate(null)}
          size="sm"
        >
          <ModalHeader
            title="Delete Template"
            description="Are you sure you want to delete this template?"
          />
          <ModalBody>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Template{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                "{deletingTemplate.templateName}"
              </strong>{" "}
              and its stored document file (
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">
                {deletingTemplate.fileName}
              </code>
              ) will be permanently deleted from the system.
            </p>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletingTemplate(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Template</span>
                  </>
                )}
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </Page>
  );
};

export default MasterWordPage;
