import React from "react";
import { DataTable } from "@/shared/ui/dataTable/dataTable";
import { Button } from "@/shared/ui/button";
import { Sparkles, FileText } from "lucide-react";
import type { ColumnDef } from "@/shared/ui/dataTable/types/dataTable.types";
import type { WordOfferRecord } from "../types/wordOffer.types";

interface WordOfferTableProps {
  data: WordOfferRecord[];
  isLoading?: boolean;
  onViewOffer?: (offer: WordOfferRecord) => void;
  onDownload?: (offer: WordOfferRecord) => void;
  downloadingId?: string | null;
}

export const WordOfferTable: React.FC<WordOfferTableProps> = ({
  data,
  isLoading,
  onViewOffer,
}) => {
  const columns: ColumnDef<WordOfferRecord>[] = [
    {
      id: "offerNumber",
      label: "Quotation Ref",
      key: "offerNumber",
    },
    {
      id: "title",
      label: "Title",
      key: "title",
    },
    {
      id: "clientName",
      label: "Client",
      key: "clientName",
    },
    {
      id: "status",
      label: "Status",
      key: "status",
    },
    {
      id: "totalAmount",
      label: "Total Value",
      key: "totalAmount",
    },
    {
      id: "createdAt",
      label: "Created At",
      key: "createdAt",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "Sent":
        return "bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "Under Review":
        return "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "Rejected":
        return "bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "Draft":
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };


  const renderCard = (row: WordOfferRecord) => {
    return (
      <div
        className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
        onClick={() => onViewOffer && onViewOffer(row)}
      >
        {/* Document Illustration Header - Identical to Master Word */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 pb-0 flex justify-center relative border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start absolute top-3 left-3 right-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400">.DOCX</span>
              <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                {row.dynamicFieldsCount !== undefined
                  ? `${row.dynamicFieldsCount} fields`
                  : `${row.boqItems?.length || 0} items`}
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusColor(
                row.status
              )}`}
            >
              {row.status}
            </span>
          </div>

          {/* Miniature Document Graphic matching Master Word */}
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

        {/* Card Body - Shows Template Name and Description */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug line-clamp-1">
              {row.templateName || row.title || (row.offerNumber ? `Quotation ${row.offerNumber}` : `Offer ${row.id}`)}
            </h3>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 flex-grow">
            {row.notes || row.project || row.clientName || ""}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-4 pt-1">
            <span className="truncate max-w-[130px]">{row.clientName || row.project || row.offerNumber || ""}</span>
            <span>{row.createdAt || ""}</span>
          </div>

          {/* Action Area */}
          <div
            className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="primary"
              className="w-full text-xs h-8 gap-1.5"
              onClick={() => onViewOffer && onViewOffer(row)}
            >
              <Sparkles size={13} />
              AI View
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No Word Offers Found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          No Word Offers match your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        enableSearch={false}
        layout="card"
        cardOrientation="vertical"
        renderCard={renderCard}
        height="100%"
        hideToolbar={true}
        pageSize={100}
      />
    </div>
  );
};

