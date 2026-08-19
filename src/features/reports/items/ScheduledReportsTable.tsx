import React from "react";
import {
  FileText,
  Download,
  Play,
  Eye,
  Calendar,
  Clock,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  FileType,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { ScheduledReport } from "../types/reports.types";

interface ScheduledReportsTableProps {
  reports: ScheduledReport[];
  onViewDetails: (report: ScheduledReport) => void;
  onRunNow: (report: ScheduledReport) => void;
  onDownload: (report: ScheduledReport) => void;
  onDelete: (id: string) => void;
}

const FORMAT_CONFIG = {
  PDF: {
    icon: FileType,
    bg: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  },
  CSV: {
    icon: FileText,
    bg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  XLSX: {
    icon: FileSpreadsheet,
    bg: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
};

export const ScheduledReportsTable: React.FC<ScheduledReportsTableProps> = ({
  reports,
  onViewDetails,
  onRunNow,
  onDownload,
  onDelete,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={18} className="text-blue-600 dark:text-blue-400" />
            Generated & Scheduled Reports Repository
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated recurring reports, exportable executive summary documents, and raw data downloads.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4 rounded-l-lg">Report Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Frequency</th>
              <th className="py-3 px-4">Format</th>
              <th className="py-3 px-4">Last Generated</th>
              <th className="py-3 px-4">Created By</th>
              <th className="py-3 px-4 text-right rounded-r-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {reports.map((report) => {
              const formatStyle = FORMAT_CONFIG[report.format] || FORMAT_CONFIG.PDF;
              const FormatIcon = formatStyle.icon;

              return (
                <tr
                  key={report.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Title & Description */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 dark:text-white text-xs mb-0.5 truncate" title={report.title}>
                      {report.title}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                      {report.description}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                      {report.category}
                    </span>
                  </td>

                  {/* Frequency */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      {report.frequency}
                    </span>
                  </td>

                  {/* Format Badge */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${formatStyle.bg}`}>
                      <FormatIcon size={12} />
                      {report.format}
                    </span>
                  </td>

                  {/* Last Generated */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {report.lastGenerated}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Next: {report.nextRunDate}
                    </div>
                  </td>

                  {/* Created By */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {report.createdBy.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                      {report.createdBy.email}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(report)}
                        title="View Report Preview"
                        className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      >
                        <Eye size={14} />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRunNow(report)}
                        title="Trigger Instant Run"
                        className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                      >
                        <Play size={13} />
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onDownload(report)}
                        title="Download Document"
                        className="h-8 px-2.5 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800"
                      >
                        <Download size={13} className="mr-1" />
                        Download
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(report.id)}
                        title="Delete Report Schedule"
                        className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 border-rose-200 dark:border-rose-900/60"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
