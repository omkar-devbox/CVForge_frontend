import React, { useState } from "react";
import { X, Sparkles, FileText, Check, Send } from "lucide-react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import type {
  CreateCustomReportParams,
  ReportDepartment,
  ReportFormat,
  ReportFrequency,
  ReportTimeframe,
  ScheduledReport,
} from "../types/reports.types";

interface GenerateCustomReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: CreateCustomReportParams) => void;
}

export const GenerateCustomReportModal: React.FC<GenerateCustomReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateCustomReportParams>({
    title: "",
    category: "Pipeline & Funnel",
    frequency: "Monthly",
    format: "PDF",
    department: "All",
    timeframe: "30d",
    recipients: "",
    description: "",
    includeAiSummary: true,
    includeFunnelData: true,
    includeSourcingRoi: true,
    includeTimeToHire: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Custom Analytics Report</h3>
              <p className="text-xs text-blue-200/80">Configure metric dimensions, export format & automated delivery schedule.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Report Title */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Report Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Q3 Engineering Time-to-Hire Bottleneck Analysis"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Executive Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of what this report covers for leadership..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Grid selections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ScheduledReport["category"] })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="Pipeline & Funnel">Pipeline & Funnel</option>
                <option value="Sourcing & ROI">Sourcing & ROI</option>
                <option value="Time to Hire">Time to Hire</option>
                <option value="Interviews & Scorecards">Interviews & Scorecards</option>
                <option value="Diversity & EEO">Diversity & EEO</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department Scope
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as ReportDepartment })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="All">All Business Units</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Design">Design</option>
                <option value="HR & Ops">HR & Ops</option>
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Run Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as ReportFrequency })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="One-time">One-time Immediate Run</option>
                <option value="Daily">Daily Automated</option>
                <option value="Weekly">Weekly Digest</option>
                <option value="Monthly">Monthly Executive Review</option>
                <option value="Quarterly">Quarterly Audit</option>
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Export Format
              </label>
              <div className="flex gap-2">
                {(["PDF", "CSV", "XLSX"] as ReportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormData({ ...formData, format: fmt })}
                    className={`flex-1 py-2 rounded-lg font-bold border transition-all ${
                      formData.format === fmt
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Email Recipients */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Recipients (Comma separated)
            </label>
            <input
              type="text"
              placeholder="hr-leads@systemmechatronics.com, cto@systemmechatronics.com"
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Metric Inclusion Checkboxes */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Metrics & Sections to Include
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includeAiSummary}
                  onChange={(e) => setFormData({ ...formData, includeAiSummary: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>AI Algorithmic Insights</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includeFunnelData}
                  onChange={(e) => setFormData({ ...formData, includeFunnelData: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Pipeline Conversion Funnel</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includeSourcingRoi}
                  onChange={(e) => setFormData({ ...formData, includeSourcingRoi: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Sourcing Channel ROI</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includeTimeToHire}
                  onChange={(e) => setFormData({ ...formData, includeTimeToHire: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Departmental Velocity</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
            >
              <Send size={14} />
              <span>Generate & Schedule Report</span>
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
