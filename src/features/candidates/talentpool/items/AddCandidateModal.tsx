import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import type { PooledCandidate, ReadinessStatus, TalentPoolCategory } from "../types/talentpool.types";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  pools: TalentPoolCategory[];
  onAddCandidate: (candidateData: Partial<PooledCandidate>) => void;
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({
  isOpen,
  onClose,
  pools,
  onAddCandidate,
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [company, setCompany] = useState("");
  const [experienceYears, setExperienceYears] = useState(3);
  const [location, setLocation] = useState("Bengaluru, India");
  const [readinessStatus, setReadinessStatus] = useState<ReadinessStatus>("Ready to Move");
  const [noticePeriod, setNoticePeriod] = useState("15 Days");
  const [skillsInput, setSkillsInput] = useState("React, TypeScript, Node.js");
  const [selectedPoolIds, setSelectedPoolIds] = useState<string[]>(
    pools.length > 0 ? [pools[0].id] : []
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onAddCandidate({
      fullName,
      email,
      phone: phone || "+91 90000 00000",
      currentRole: currentRole || "Software Engineer",
      company: company || "Tech Company",
      experienceYears,
      location,
      readinessStatus,
      noticePeriod,
      skills: skills.length > 0 ? skills : ["Software Development"],
      primarySkill: skills[0] || "Engineering",
      poolIds: selectedPoolIds,
      rating: 4,
      matchScore: 92,
      aiSummary: `Pre-vetted ${currentRole || "Engineer"} added directly to talent pool with ${experienceYears} years experience.`,
      addedToPoolDate: new Date().toISOString().split("T")[0],
    });

    onClose();
  };

  const togglePoolSelect = (poolId: string) => {
    if (selectedPoolIds.includes(poolId)) {
      setSelectedPoolIds(selectedPoolIds.filter((id) => id !== poolId));
    } else {
      setSelectedPoolIds([...selectedPoolIds, poolId]);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title="Add Candidate to Talent Pool"
          description="Quickly index a pre-vetted candidate into your curated talent pools."
          onClose={onClose}
        />
        <ModalBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Vikram Malhotra"
                value={fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. vikram@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Role / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Architect"
                value={currentRole}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentRole(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Company
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                value={company}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={experienceYears}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Readiness Status
              </label>
              <select
                value={readinessStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReadinessStatus(e.target.value as ReadinessStatus)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Ready to Move">Ready to Move</option>
                <option value="Exploring">Exploring</option>
                <option value="Passive">Passive</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notice Period
              </label>
              <select
                value={noticePeriod}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNoticePeriod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Immediate">Immediate</option>
                <option value="15 Days">15 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="60 Days">60 Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Skills (Comma Separated)
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, GraphQL, AWS"
              value={skillsInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkillsInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Select Pools */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assign to Talent Pools
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
              {pools.map((p) => {
                const isSelected = selectedPoolIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePoolSelect(p.id)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 font-semibold"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {p.name} {isSelected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Add to Talent Pool
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
