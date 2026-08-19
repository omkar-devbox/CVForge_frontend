import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import type { TalentPoolCategory } from "../types/talentpool.types";
import { Sparkles, Code2, Award, Server, Briefcase, Zap, X } from "lucide-react";

interface TalentPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pool: Partial<TalentPoolCategory>) => void;
  editingPool?: TalentPoolCategory | null;
}

const COLOR_OPTIONS: TalentPoolCategory["color"][] = [
  "blue",
  "purple",
  "emerald",
  "amber",
  "rose",
  "cyan",
  "indigo",
];

const ICON_OPTIONS = [
  { name: "Code2", label: "Code", icon: Code2 },
  { name: "Sparkles", label: "AI / Sparkles", icon: Sparkles },
  { name: "Award", label: "Award / Medal", icon: Award },
  { name: "Server", label: "DevOps / Server", icon: Server },
  { name: "Briefcase", label: "Business / Executive", icon: Briefcase },
  { name: "Zap", label: "Fast Track / Zap", icon: Zap },
];

export const TalentPoolModal: React.FC<TalentPoolModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPool,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<TalentPoolCategory["color"]>("blue");
  const [iconName, setIconName] = useState("Code2");
  const [owner, setOwner] = useState("Aniket Sharma");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [targetRoleInput, setTargetRoleInput] = useState("");

  useEffect(() => {
    if (editingPool) {
      setName(editingPool.name);
      setDescription(editingPool.description);
      setColor(editingPool.color);
      setIconName(editingPool.iconName);
      setOwner(editingPool.owner);
      setTags(editingPool.tags || []);
      setTargetRoles(editingPool.targetRoles || []);
    } else {
      setName("");
      setDescription("");
      setColor("blue");
      setIconName("Code2");
      setOwner("Aniket Sharma");
      setTags(["React", "TypeScript"]);
      setTargetRoles(["Lead Engineer"]);
    }
  }, [editingPool, isOpen]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddRole = () => {
    if (targetRoleInput.trim() && !targetRoles.includes(targetRoleInput.trim())) {
      setTargetRoles([...targetRoles, targetRoleInput.trim()]);
      setTargetRoleInput("");
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setTargetRoles(targetRoles.filter((r) => r !== roleToRemove));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: editingPool?.id,
      name,
      description,
      color,
      iconName,
      owner,
      tags,
      targetRoles,
      candidateCount: editingPool?.candidateCount || 0,
      updatedDate: new Date().toISOString().split("T")[0],
    });
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title={editingPool ? "Edit Talent Pool" : "Create New Talent Pool"}
          description="Organize candidates into curated pools by skill, role, or readiness."
          onClose={onClose}
        />
        <ModalBody className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Talent Pool Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. AI & LLM Architects, Senior Frontend Leaders"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Purpose
            </label>
            <textarea
              placeholder="Brief summary of who belongs in this pool and inclusion criteria..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Icon & Color Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = iconName === item.name;
                  return (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => setIconName(item.name)}
                      className={`p-2 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <IconComp size={16} />
                      {item.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Color Theme Accent
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      c === "blue"
                        ? "bg-blue-500"
                        : c === "purple"
                        ? "bg-purple-500"
                        : c === "emerald"
                        ? "bg-emerald-500"
                        : c === "amber"
                        ? "bg-amber-500"
                        : c === "rose"
                        ? "bg-rose-500"
                        : c === "cyan"
                        ? "bg-cyan-500"
                        : "bg-indigo-500"
                    } ${color === c ? "ring-2 ring-offset-2 ring-slate-800 scale-110" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Key Required Skills / Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill tag (e.g. Python, PyTorch)..."
                value={tagInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                Add Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800"
                >
                  {t}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-rose-500"
                    onClick={() => handleRemoveTag(t)}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Target Roles */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Requisition Roles
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add role title (e.g. Lead Engineer, Product Architect)..."
                value={targetRoleInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetRoleInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRole();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddRole}>
                Add Role
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {targetRoles.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-800"
                >
                  {r}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-rose-500"
                    onClick={() => handleRemoveRole(r)}
                  />
                </span>
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {editingPool ? "Update Pool" : "Save Talent Pool"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
