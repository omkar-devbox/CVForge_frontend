import React, { useState } from "react";
import { Page } from "@/shared/pages/Page/Page";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { MasterWordForm } from "./items/MasterWordForm";
import { MasterWordTable } from "./items/MasterWordTable";
import { MasterWordEdit } from "./items/MasterWordEdit";
import type { MasterWordFormValues, TemplateRecord } from "./types/masterWord.types";

const MOCK_DATA: TemplateRecord[] = [
  {
    id: "1",
    templateName: "Engine Dressing Conveyor Quotation",
    description: "Palletised engine dressing conveyor for 4SP/497 and Cummins engines quotation with full technical specifications.",
    fileName: "Q-2026-019-Engine dressing conveyor _R0_Mar_12_26 (1) (1).docx",
    createdAt: "Just now",
    category: "ENGINEERING / SALES",
    version: "v1.0 Final",
    status: "Active Production",
    size: "9.2 MB",
    variables: ["{{quotation_no}}", "{{quotation_date}}", "{{client_attn}}", "{{project_title}}", "{{contact_person}}"],
    author: "Vijay Shete",
    authorAvatar: "https://i.pravatar.cc/150?u=vijay",
    isJsonSchemaValid: true,
  },
  {
    id: "2",
    templateName: "Mutual Non-Disclosure Agreement (NDA)",
    description: "Standard bilateral confidentiality agreement with proprietary information definition and 3-year term restrictions.",
    fileName: "NDA_Contractor.docx",
    createdAt: "Yesterday at 4:15 PM",
    category: "LEGAL & COMPLIANCE",
    version: "v1.2 Certified",
    status: "Published",
    size: "68 KB",
    variables: ["{{counterparty_name}}", "{{effective_date}}", "{{jurisdiction}}", "{{purpose}}"],
    author: "David Chen",
    authorAvatar: "https://i.pravatar.cc/150?u=david",
    isJsonSchemaValid: false,
  },
  {
    id: "3",
    templateName: "Executive Compensation & Equity Grant Addendum",
    description: "ISO & NSO option vesting schedules, bonus metrics, and executive severance terms with Board resolutions.",
    fileName: "Exec_Comp_Addendum.docx",
    createdAt: "3 days ago",
    category: "EXECUTIVE / HR",
    version: "Restricted Access",
    status: "Draft",
    size: "55 KB",
    variables: ["{{vesting_commencement}}", "{{cliff_percentage}}", "{{bonus_target}}", "{{severance_months}}"],
    author: "Elena Rostova",
    authorAvatar: "https://i.pravatar.cc/150?u=elena",
    isJsonSchemaValid: false,
  },
];

export const MasterWordPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateRecord | null>(null);
  const [templates, setTemplates] = useState(MOCK_DATA);

  const handleCreateSubmit = (data: MasterWordFormValues) => {
    // Mock adding the new template
    const newTemplate: TemplateRecord = {
      id: Date.now().toString(),
      templateName: data.templateName,
      description: data.description || "",
      fileName: data.file ? (data.file as any).name || "uploaded_file.docx" : "document.docx",
      createdAt: "Just now",
      category: "DRAFT FOLDER",
      version: "v1.0",
      status: "Draft",
      size: "0 KB",
      variables: [],
      author: "Current User",
      authorAvatar: "https://i.pravatar.cc/150?u=current",
      isJsonSchemaValid: false,
    };
    
    setTemplates((prev) => [newTemplate, ...prev]);
    setIsFormOpen(false);
  };

  const handleEdit = (template: TemplateRecord) => {
    setEditingTemplate(template);
  };

  const handleCloseEdit = () => {
    setEditingTemplate(null);
  };

  const handleSaveEdit = () => {
    // Save logic here
    setEditingTemplate(null);
  };

  return (
    <Page
      title={editingTemplate ? `Edit: ${editingTemplate.templateName}` : "Master Word Templates"}
      subtitle={editingTemplate ? "Edit template content and structure." : "View and manage master word templates."}
      breadcrumbs={[
        { label: "Home", path: "/master-word" },
        { label: "Master Word", path: "/master-word" },
      ]}
      actions={
        <div className="flex gap-2">
          {!isFormOpen && !editingTemplate && (
            <Button variant="primary" onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus size={16} />
              Add Template
            </Button>
          )}
          {editingTemplate && (
            <>
              <Button variant="outline" onClick={handleCloseEdit}>
                Discard
              </Button>
              <Button variant="primary" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="flex flex-col w-full h-full">
        {isFormOpen && (
          <MasterWordForm 
            onClose={() => setIsFormOpen(false)} 
            onSubmit={handleCreateSubmit} 
          />
        )}
        
        {editingTemplate && (
          <MasterWordEdit 
            template={editingTemplate}
            onClose={handleCloseEdit}
            onSave={handleSaveEdit}
          />
        )}
        
        {!isFormOpen && !editingTemplate && (
          <div className="flex-1 w-full relative">
            <MasterWordTable data={templates} onEdit={handleEdit} />
          </div>
        )}
      </div>
    </Page>
  );
};

export default MasterWordPage;
