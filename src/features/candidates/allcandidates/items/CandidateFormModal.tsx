import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import type { Candidate, CandidateStatus, CandidateStage } from "../types/candidate.types";

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
  const [formData, setFormData] = useState<Partial<Candidate>>({
    fullName: "",
    email: "",
    phone: "",
    currentRole: "",
    company: "",
    experienceYears: 3,
    location: "Bengaluru, India",
    skills: ["React", "TypeScript", "Node.js"],
    highestDegree: "B.Tech in Computer Science",
    status: "Active",
    stage: "New",
    source: "LinkedIn",
    appliedJobTitle: "Senior Software Engineer",
    rating: 4,
    noticePeriod: "30 Days",
    currentSalary: "₹15,00,000 / yr",
    expectedSalary: "₹20,00,000 / yr",
    tags: ["Candidate"],
  });

  const [skillsInput, setSkillsInput] = useState("");

  useEffect(() => {
    if (editingCandidate) {
      setFormData(editingCandidate);
      setSkillsInput(editingCandidate.skills ? editingCandidate.skills.join(", ") : "");
    } else {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        currentRole: "",
        company: "",
        experienceYears: 3,
        location: "Bengaluru, India",
        skills: ["React", "TypeScript", "Node.js"],
        highestDegree: "B.Tech in Computer Science",
        status: "Active",
        stage: "New",
        source: "LinkedIn",
        appliedJobTitle: "Senior Software Engineer",
        rating: 4,
        noticePeriod: "30 Days",
        currentSalary: "₹15,00,000 / yr",
        expectedSalary: "₹20,00,000 / yr",
        tags: ["Candidate"],
      });
      setSkillsInput("React, TypeScript, Node.js");
    }
  }, [editingCandidate, isOpen]);

  const handleChange = (field: keyof Candidate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSaveCandidate({
      ...formData,
      skills: skillsArray,
      primarySkill: skillsArray[0] || "General Engineering",
    });
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader
        title={editingCandidate ? "Edit Candidate Profile" : "Add New Candidate"}
        description="Enter candidate details, experience, skills, and application status."
        onClose={onClose}
      />

      <form onSubmit={handleSubmit}>
        <ModalBody className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName || ""}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="e.g. priya.sharma@example.com"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Phone & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="e.g. Bengaluru, India"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Current Role & Current Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Current Role
              </label>
              <input
                type="text"
                value={formData.currentRole || ""}
                onChange={(e) => handleChange("currentRole", e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Current Company
              </label>
              <input
                type="text"
                value={formData.company || ""}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="e.g. TechCorp Solutions"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Experience & Notice Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                value={formData.experienceYears ?? 3}
                onChange={(e) => handleChange("experienceYears", Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Notice Period
              </label>
              <select
                value={formData.noticePeriod || "30 Days"}
                onChange={(e) => handleChange("noticePeriod", e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Immediate">Immediate Joiner</option>
                <option value="15 Days">15 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="60 Days">60 Days</option>
                <option value="90 Days">90 Days</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Skills (Comma-separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. React, TypeScript, Node.js, AWS"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Status
              </label>
              <select
                value={formData.status || "Active"}
                onChange={(e) => handleChange("status", e.target.value as CandidateStatus)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Pipeline Stage
              </label>
              <select
                value={formData.stage || "New"}
                onChange={(e) => handleChange("stage", e.target.value as CandidateStage)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="New">New</option>
                <option value="Screening">Screening</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Rating & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Rating (1 - 5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={formData.rating ?? 4}
                onChange={(e) => handleChange("rating", Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Source
              </label>
              <select
                value={formData.source || "LinkedIn"}
                onChange={(e) => handleChange("source", e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Naukri">Naukri</option>
                <option value="Referral">Employee Referral</option>
                <option value="Career Page">Career Page</option>
                <option value="Agency">Recruitment Agency</option>
              </select>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            {editingCandidate ? "Save Changes" : "Create Candidate"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
