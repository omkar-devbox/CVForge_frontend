import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { User, Mail, Phone, DollarSign, Clock, Tag, Activity, FileText } from "lucide-react";
import type { Candidate, CandidateStatus, CandidateNote } from "../types/candidate.types";
import { formatDateTime } from "@/shared/lib/utils";

export interface CandidateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCandidate: (candidateData: Partial<Candidate>) => void;
  editingCandidate?: Candidate | null;
}

export const CandidateFormModal: React.FC<CandidateFormModalProps> = ({
  isOpen,
  onClose,
  onSaveCandidate,
  editingCandidate,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "Active" as CandidateStatus,
    noticePeriod: "",
    currentSalary: "",
    expectedSalary: "",
    source: "",
    note: "",
  });

  useEffect(() => {
    if (editingCandidate) {
      setFormData({
        fullName: editingCandidate.fullName && editingCandidate.fullName !== "—" ? editingCandidate.fullName : "",
        email: editingCandidate.email && editingCandidate.email !== "—" ? editingCandidate.email : "",
        phone: editingCandidate.phone && editingCandidate.phone !== "—" ? editingCandidate.phone : "",
        status: editingCandidate.status || "Active",
        noticePeriod: editingCandidate.noticePeriod && editingCandidate.noticePeriod !== "—" ? editingCandidate.noticePeriod : "",
        currentSalary: editingCandidate.currentSalary && editingCandidate.currentSalary !== "—" ? editingCandidate.currentSalary : "",
        expectedSalary: editingCandidate.expectedSalary && editingCandidate.expectedSalary !== "—" ? editingCandidate.expectedSalary : "",
        source: editingCandidate.source && editingCandidate.source !== "—" ? editingCandidate.source : "",
        note:
          editingCandidate.note?.trim() ||
          (editingCandidate.notes && editingCandidate.notes.length > 0
            ? editingCandidate.notes[0].text?.trim()
            : "") ||
          "",
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        status: "Active",
        noticePeriod: "",
        currentSalary: "",
        expectedSalary: "",
        source: "",
        note: "",
      });
    }
  }, [editingCandidate, isOpen]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingNotes = editingCandidate?.notes || [];
    const noteText = formData.note.trim();
    let updatedNotes: CandidateNote[] = [...existingNotes];

    if (noteText) {
      if (existingNotes.length > 0 && existingNotes[0].text === noteText) {
        // Note unchanged
        updatedNotes = existingNotes;
      } else {
        // Prepend new or updated note
        updatedNotes = [
          {
            id: `NOTE-${Date.now()}`,
            author: "Recruiter Note",
            text: noteText,
            date: new Date().toISOString(),
          },
          ...existingNotes.filter((n) => n.text !== noteText),
        ];
      }
    } else {
      updatedNotes = [];
    }

    onSaveCandidate({
      ...(editingCandidate || {}),
      fullName: formData.fullName.trim() || editingCandidate?.fullName || "Candidate",
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      status: formData.status,
      noticePeriod: formData.noticePeriod,
      currentSalary: formData.currentSalary,
      expectedSalary: formData.expectedSalary,
      source: formData.source,
      note: noteText,
      notes: updatedNotes,
    });
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="2xl" className="w-full">
      <ModalHeader
        title={editingCandidate ? "Edit Candidate Profile" : "Add Candidate"}
        description="Update candidate contact information, recruitment status, CTC, and remarks."
        onClose={onClose}
      />

      <form onSubmit={handleSubmit}>
        <ModalBody className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {/* Section 1: Contact Details (Editable) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Basic & Contact Information
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="e.g. priya@example.com"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Contact Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Recruitment & Compensation */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Recruitment & Compensation
            </h4>

            {/* Status & Notice Period */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value as CandidateStatus)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="In Pipeline">In Pipeline</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Hired">Hired</option>
                  <option value="Archived">Archived</option>
                  <option value="Blacklisted">Blacklisted</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Notice Period
                </label>
                <input
                  type="text"
                  list="notice-period-presets"
                  value={formData.noticePeriod}
                  onChange={(e) => handleChange("noticePeriod", e.target.value)}
                  placeholder="e.g. Immediate, 30 Days"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="notice-period-presets">
                  <option value="Immediate" />
                  <option value="15 Days" />
                  <option value="30 Days" />
                  <option value="60 Days" />
                  <option value="90 Days" />
                </datalist>
              </div>
            </div>

            {/* Current CTC & Expected CTC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Current CTC
                </label>
                <input
                  type="text"
                  value={formData.currentSalary}
                  onChange={(e) => handleChange("currentSalary", e.target.value)}
                  placeholder="e.g. ₹15,00,000 / yr or 15 LPA"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Expected CTC
                </label>
                <input
                  type="text"
                  value={formData.expectedSalary}
                  onChange={(e) => handleChange("expectedSalary", e.target.value)}
                  placeholder="e.g. ₹20,00,000 / yr or 20 LPA"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Source */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Source
              </label>
              <input
                type="text"
                list="candidate-sources-list"
                value={formData.source}
                onChange={(e) => handleChange("source", e.target.value)}
                placeholder="e.g. LinkedIn, Naukri, Referral, Project Name"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="candidate-sources-list">
                <option value="LinkedIn" />
                <option value="Naukri" />
                <option value="Employee Referral" />
                <option value="Career Page" />
                <option value="Recruitment Agency" />
              </datalist>
            </div>
          </div>

          {/* Section 3: Note Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Note / Remarks
            </label>
            <textarea
              rows={3}
              value={formData.note}
              onChange={(e) => handleChange("note", e.target.value)}
              placeholder="Add interview feedback, notes, or remarks about this candidate..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
            />

            {/* Show previous notes if editing candidate */}
            {editingCandidate?.notes && editingCandidate.notes.length > 0 && (
              <div className="mt-2.5 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  Previous Notes ({editingCandidate.notes.length})
                </span>
                {editingCandidate.notes.map((n) => {
                  const noteDateStr =
                    n.date ||
                    (n as any).created_at ||
                    (n as any).timestamp ||
                    editingCandidate.createdAt;
                  return (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-[11px]"
                    >
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-0.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {n.author || "Recruiter Note"}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          {formatDateTime(noteDateStr)}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {n.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            Save Changes
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
