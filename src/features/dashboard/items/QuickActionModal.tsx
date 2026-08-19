import React, { useState } from "react";
import { UserPlus, Briefcase, Sparkles } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/formField";
import { toast } from "@/shared/ui/toast";

interface QuickActionModalProps {
  open: boolean;
  onClose: () => void;
  initialType?: "candidate" | "job";
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  open,
  onClose,
  initialType = "candidate",
}) => {
  const [activeType, setActiveType] = useState<"candidate" | "job">(initialType);

  // Candidate Form state
  const [candName, setCandName] = useState("");
  const [candEmail, setCandEmail] = useState("");
  const [candRole, setCandRole] = useState("Senior Embedded Systems Engineer");
  const [candExp, setCandExp] = useState("5");

  // Job Form state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDept, setJobDept] = useState("Mechatronics R&D");
  const [jobLocation, setJobLocation] = useState("San Jose, CA (Hybrid)");
  const [jobType, setJobType] = useState("Full-time");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeType === "candidate") {
      if (!candName || !candEmail) {
        toast.error("Please enter candidate name and email address.");
        return;
      }
      toast.success(`Candidate profile "${candName}" added successfully to pipeline!`);
    } else {
      if (!jobTitle) {
        toast.error("Please enter a job position title.");
        return;
      }
      toast.success(`Job Opening "${jobTitle}" created & published!`);
    }

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalHeader
        title={
          <div className="flex items-center gap-2">
            {activeType === "candidate" ? (
              <UserPlus className="text-blue-600 dark:text-blue-400" size={20} />
            ) : (
              <Briefcase className="text-purple-600 dark:text-purple-400" size={20} />
            )}
            <span>{activeType === "candidate" ? "Add Candidate Profile" : "Create New Job Opening"}</span>
          </div>
        }
        onClose={onClose}
      />

      <ModalBody>
        {/* Toggle Mode */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
          <button
            type="button"
            onClick={() => setActiveType("candidate")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
              activeType === "candidate"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <UserPlus size={14} />
            <span>Add Candidate</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType("job")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
              activeType === "job"
                ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Briefcase size={14} />
            <span>Create Job Opening</span>
          </button>
        </div>

        <form id="quick-action-form" onSubmit={handleSubmit} className="space-y-4">
          {activeType === "candidate" ? (
            <>
              <FormField
                type="text"
                label="Candidate Full Name"
                required
                placeholder="e.g. Dr. Alex Mercer"
                value={candName}
                onChange={(val: any) => setCandName(val?.target?.value ?? val ?? "")}
              />

              <FormField
                type="email"
                label="Email Address"
                required
                placeholder="alex.mercer@example.com"
                value={candEmail}
                onChange={(val: any) => setCandEmail(val?.target?.value ?? val ?? "")}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  type="select"
                  label="Applied Position"
                  value={candRole}
                  onChange={(val: any) => setCandRole(val?.value ?? val ?? "")}
                  options={[
                    { label: "Senior Embedded Firmware Engineer", value: "Senior Embedded Firmware Engineer" },
                    { label: "Robotics Motion Control Engineer", value: "Robotics Motion Control Engineer" },
                    { label: "Computer Vision Lead", value: "Computer Vision Lead" },
                    { label: "PLC Automation Specialist", value: "PLC Automation Specialist" },
                  ]}
                />

                <FormField
                  type="number"
                  label="Experience (Years)"
                  value={candExp}
                  onChange={(val: any) => setCandExp(val?.target?.value ?? val ?? "")}
                />
              </div>
            </>
          ) : (
            <>
              <FormField
                type="text"
                label="Job Position Title"
                required
                placeholder="e.g. Lead Control Systems Engineer"
                value={jobTitle}
                onChange={(val: any) => setJobTitle(val?.target?.value ?? val ?? "")}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  type="select"
                  label="Department"
                  value={jobDept}
                  onChange={(val: any) => setJobDept(val?.value ?? val ?? "")}
                  options={[
                    { label: "Mechatronics R&D", value: "Mechatronics R&D" },
                    { label: "Embedded Systems", value: "Embedded Systems" },
                    { label: "AI & Sensing", value: "AI & Sensing" },
                    { label: "Automation & Control", value: "Automation & Control" },
                    { label: "Hardware & Systems", value: "Hardware & Systems" },
                  ]}
                />

                <FormField
                  type="select"
                  label="Employment Type"
                  value={jobType}
                  onChange={(val: any) => setJobType(val?.value ?? val ?? "")}
                  options={[
                    { label: "Full-time", value: "Full-time" },
                    { label: "Contract", value: "Contract" },
                    { label: "Remote", value: "Remote" },
                  ]}
                />
              </div>

              <FormField
                type="text"
                label="Location"
                value={jobLocation}
                onChange={(val: any) => setJobLocation(val?.target?.value ?? val ?? "")}
              />
            </>
          )}
        </form>
      </ModalBody>

      <ModalFooter className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="quick-action-form"
          variant="primary"
          size="sm"
          className="gap-1.5"
        >
          <Sparkles size={14} />
          <span>{activeType === "candidate" ? "Save Candidate" : "Publish Job"}</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
};
