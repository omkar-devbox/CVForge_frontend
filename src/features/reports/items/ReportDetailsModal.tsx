import React from "react";
import { X, FileText, Download, Calendar, User, Clock, CheckCircle2 } from "lucide-react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import type { ScheduledReport } from "../types/reports.types";

interface ReportDetailsModalProps {
  report: ScheduledReport | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (report: ScheduledReport) => void;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  isOpen,
  onClose,
  onDownload,
}) => {
  if (!report) return null;

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{report.title}</h3>
              <p className="text-xs text-slate-400">Category: {report.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
              Executive Summary
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {report.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Schedule Frequency:</span>
                <span className="font-bold text-slate-900 dark:text-white">{report.frequency}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Export Format:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{report.format} ({report.fileSize || "2.4 MB"})</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Recipient Count:</span>
                <span className="font-bold text-slate-900 dark:text-white">{report.recipientCount} Email Subscribers</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Last Generated:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{report.lastGenerated}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Next Scheduled Run:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{report.nextRunDate}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} /> {report.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
              <User size={15} />
              <span>Created by <strong>{report.createdBy.name}</strong> ({report.createdBy.email})</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} size="sm">
              Close Preview
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onDownload(report);
                onClose();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Download Full Document</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
