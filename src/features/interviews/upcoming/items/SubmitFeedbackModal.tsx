import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { CustomSelect } from "@/shared/ui/formField";
import { Button } from "@/shared/ui/button";
import { Star, MessageSquarePlus, CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";
import type { UpcomingInterview, InterviewFeedback } from "../types/upcoming.types";

interface SubmitFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: UpcomingInterview | null;
  onSubmitFeedback: (
    interviewId: string,
    feedback: Partial<InterviewFeedback>
  ) => void;
}

export const SubmitFeedbackModal: React.FC<SubmitFeedbackModalProps> = ({
  isOpen,
  onClose,
  interview,
  onSubmitFeedback,
}) => {
  const [rating, setRating] = useState<number>(4);
  const [recommendation, setRecommendation] = useState<"Strong Hire" | "Hire" | "Hold" | "Reject">("Hire");
  const [technicalScore, setTechnicalScore] = useState<number>(4);
  const [communicationScore, setCommunicationScore] = useState<number>(5);
  const [problemSolvingScore, setProblemSolvingScore] = useState<number>(4);
  const [comments, setComments] = useState("");

  if (!interview) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitFeedback(interview.id, {
      rating,
      recommendation,
      technicalScore,
      communicationScore,
      problemSolvingScore,
      comments,
      interviewerName: "Dr. Ananya Roy",
      createdAt: new Date().toISOString().split("T")[0],
    });
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader title={`Submit Interview Feedback - ${interview.candidateName}`} onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Candidate & Round Header Info */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {interview.candidateName}
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-2">
                ({interview.jobTitle} • {interview.round})
              </span>
            </div>
            <span className="font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
              Scorecard Entry
            </span>
          </div>

          {/* Overall Rating (1-5 Stars) */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Overall Candidate Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Recommendation */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Hiring Recommendation
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Strong Hire", val: "Strong Hire", color: "border-emerald-500 bg-emerald-50 text-emerald-800" },
                { label: "Hire", val: "Hire", color: "border-blue-500 bg-blue-50 text-blue-800" },
                { label: "Hold", val: "Hold", color: "border-amber-500 bg-amber-50 text-amber-800" },
                { label: "Reject", val: "Reject", color: "border-rose-500 bg-rose-50 text-rose-800" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setRecommendation(opt.val as any)}
                  className={`p-2.5 rounded-lg border font-bold text-xs text-center transition-all ${
                    recommendation === opt.val
                      ? `${opt.color} ring-2 ring-blue-400 shadow-xs`
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Competency Ratings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/40">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Technical Depth
              </label>
              <CustomSelect
                options={[
                  { label: "5 - Exceptional", value: "5" },
                  { label: "4 - Strong", value: "4" },
                  { label: "3 - Average", value: "3" },
                  { label: "2 - Below Avg", value: "2" },
                  { label: "1 - Poor", value: "1" },
                ]}
                value={String(technicalScore)}
                onChange={(val: any) => setTechnicalScore(Number(val))}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Communication
              </label>
              <CustomSelect
                options={[
                  { label: "5 - Exceptional", value: "5" },
                  { label: "4 - Strong", value: "4" },
                  { label: "3 - Average", value: "3" },
                  { label: "2 - Below Avg", value: "2" },
                  { label: "1 - Poor", value: "1" },
                ]}
                value={String(communicationScore)}
                onChange={(val: any) => setCommunicationScore(Number(val))}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Problem Solving
              </label>
              <CustomSelect
                options={[
                  { label: "5 - Exceptional", value: "5" },
                  { label: "4 - Strong", value: "4" },
                  { label: "3 - Average", value: "3" },
                  { label: "2 - Below Avg", value: "2" },
                  { label: "1 - Poor", value: "1" },
                ]}
                value={String(problemSolvingScore)}
                onChange={(val: any) => setProblemSolvingScore(Number(val))}
              />
            </div>
          </div>

          {/* Assessment Comments & Detailed Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Detailed Assessment & Notes
            </label>
            <textarea
              rows={4}
              placeholder="Detail key strengths, areas for improvement, system design answers, code quality, and specific questions answered."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
            Submit Feedback
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
