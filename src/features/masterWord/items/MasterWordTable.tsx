import React from "react";
import { DataTable } from "@/shared/ui/dataTable/dataTable";
import { Button } from "@/shared/ui/button";
import { MoreVertical, Download, Trash2, Edit2 } from "lucide-react";
import type { ColumnDef } from "@/shared/ui/dataTable/types/dataTable.types";
import type { TemplateRecord } from "../types/masterWord.types";

interface MasterWordTableProps {
  data: TemplateRecord[];
  isLoading?: boolean;
  onEdit?: (template: TemplateRecord) => void;
}

export const MasterWordTable: React.FC<MasterWordTableProps> = ({ data, isLoading, onEdit }) => {
  const columns: ColumnDef<TemplateRecord>[] = [
    {
      id: "templateName",
      label: "Template Name",
      key: "templateName",
    },
    {
      id: "category",
      label: "Category",
      key: "category",
    },
    {
      id: "status",
      label: "Status",
      key: "status",
    },
    {
      id: "createdAt",
      label: "Created At",
      key: "createdAt",
    },
  ];

  const renderCard = (row: TemplateRecord) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "Active Production":
        case "Published":
          return "bg-emerald-100 text-emerald-800";
        case "Draft":
          return "bg-blue-100 text-blue-800";
        case "Restricted Access":
        default:
          return "bg-slate-100 text-slate-600";
      }
    };

    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        {/* Document Illustration Header */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 pb-0 flex justify-center relative border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start absolute top-3 left-3 right-3">
            <div className="flex gap-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400">.DOCX</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(row.status)}`}>
              {row.status}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-950 w-3/4 max-w-[200px] aspect-[1/1.2] mt-6 rounded-t-lg shadow-sm border border-slate-200 dark:border-slate-700 border-b-0 p-4 flex flex-col gap-3">
            <div className="w-full h-2 bg-blue-600/80 rounded-sm"></div>
            <div className="w-3/4 h-2 bg-slate-700/80 rounded-sm"></div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-sm mt-2"></div>
            <div className="w-5/6 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>

            <div className="flex gap-2 mt-auto">
              <div className="w-1/3 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-sm"></div>
              <div className="w-1/3 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2 leading-tight">
            {row.templateName}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-grow">
            {row.description}
          </p>

          <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="primary" className="flex-1 text-xs h-8 gap-1.5" onClick={() => onEdit && onEdit(row)}>
              <Edit2 size={12} />
              Edit Template
            </Button>
            <Button variant="outline" className="w-8 h-8 p-0 flex items-center justify-center">
              <Download size={14} className="text-slate-600" />
            </Button>
            <Button variant="outline" className="w-8 h-8 p-0 flex items-center justify-center bg-red-50 hover:bg-red-100 border-red-100">
              <Trash2 size={14} className="text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        enableSearch={true}
        layout="card"
        cardOrientation="vertical"
        renderCard={renderCard}
        height="100%"
        hideToolbar={true}
      />
    </div>
  );
};
