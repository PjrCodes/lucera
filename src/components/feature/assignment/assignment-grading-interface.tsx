"use client";

import { useState, useEffect } from "react";
import { SubmittedAssignmentWithEmbeddedData, Assignment } from "@/lib/schemas/database";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { TextArea } from "@/components/core/inputs/text-area";
import { TextBox } from "@/components/core/inputs/text-box";
import { useAlertDialog } from "@/components/core/alert-dialog";
import {
  FiArrowLeft,
  FiArrowRight,
  FiX,
  FiSave,
  FiEye,
  FiUser,
  FiCalendar,
  FiFileText
} from "react-icons/fi";

interface AssignmentGradingInterfaceProps {
  submissions: SubmittedAssignmentWithEmbeddedData[];
  assignment: Assignment;
  currentSubmissionIndex: number;
  onClose: () => void;
  onSubmissionChange: (index: number) => void;
  onGradeUpdated: () => void;
}

export default function AssignmentGradingInterface({
  submissions,
  assignment,
  currentSubmissionIndex,
  onClose,
  onSubmissionChange,
  onGradeUpdated,
}: AssignmentGradingInterfaceProps) {
  const currentSubmission = submissions[currentSubmissionIndex];
  const [grade, setGrade] = useState<string>(currentSubmission?.grade?.toString() || "");
  const [feedback, setFeedback] = useState<string>(currentSubmission?.feedback || "");
  const [rubricGrades, setRubricGrades] = useState<{ [key: string]: { levelRank: number; points: number } }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const {
    showError,
    showSuccess,
    AlertDialog,
  } = useAlertDialog();

  const isRubricBased = assignment.grading.method === "rubric";
  const totalPoints = assignment.grading.total_points;

  // Initialize rubric grades when submission changes
  useEffect(() => {
    if (currentSubmission && isRubricBased) {
      const initialRubricGrades: { [key: string]: { levelRank: number; points: number } } = {};

      if (currentSubmission.rubricGrades) {
        currentSubmission.rubricGrades.forEach((rg) => {
          initialRubricGrades[rg.criteriaIndex.toString()] = {
            levelRank: rg.levelRank,
            points: rg.points
          };
        });
      }

      setRubricGrades(initialRubricGrades);
    }

    setGrade(currentSubmission?.grade?.toString() || "");
    setFeedback(currentSubmission?.feedback || "");
  }, [currentSubmission, isRubricBased]);

  // Calculate total grade from rubric
  useEffect(() => {
    if (isRubricBased) {
      const totalRubricPoints = Object.values(rubricGrades).reduce((sum, rg) => sum + rg.points, 0);
      const percentage = Math.round((totalRubricPoints / totalPoints) * 100);
      setGrade(percentage.toString());
    }
  }, [rubricGrades, isRubricBased, totalPoints]);

  const handleRubricGradeChange = (criteriaIndex: number, levelRank: number, points: number) => {
    setRubricGrades(prev => ({
      ...prev,
      [criteriaIndex.toString()]: { levelRank, points }
    }));
  };

  const handleSaveGrade = async () => {
    if (!currentSubmission) return;

    setIsSubmitting(true);
    try {
      const requestData = {
        grade: parseFloat(grade),
        feedback,
        rubricGrades: isRubricBased ? Object.entries(rubricGrades).map(([criteriaIndex, rg]) => ({
          criteriaIndex: parseInt(criteriaIndex),
          levelRank: rg.levelRank,
          points: rg.points
        })) : undefined
      };

      const response = await fetch(`/api/assignment/submissions/${currentSubmission._id}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Failed to save grade");
      }

      const result = await response.json();

      // Show success message with unpublishing notification
      showSuccess("Grade Saved", result.message || "Grade updated successfully. Grades have been unpublished and need to be republished.");

      onGradeUpdated();

      // Move to next submission if available
      if (currentSubmissionIndex < submissions.length - 1) {
        onSubmissionChange(currentSubmissionIndex + 1);
      }
    } catch (error) {
      console.error("Error saving grade:", error);
      showError("Save Failed", "Failed to save grade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviousSubmission = () => {
    if (currentSubmissionIndex > 0) {
      onSubmissionChange(currentSubmissionIndex - 1);
    }
  };

  const handleNextSubmission = () => {
    if (currentSubmissionIndex < submissions.length - 1) {
      onSubmissionChange(currentSubmissionIndex + 1);
    }
  };

  if (!currentSubmission) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <AlertDialog />
      <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Grade Assignment</h2>
            <div className="bg-primary-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-primary-700">
                {currentSubmissionIndex + 1} of {submissions.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SecondaryButton
              variant="outline"
              onClick={handlePreviousSubmission}
              disabled={currentSubmissionIndex === 0}
            >
              <FiArrowLeft className="w-4 h-4" />
              Previous
            </SecondaryButton>
            <SecondaryButton
              variant="outline"
              onClick={handleNextSubmission}
              disabled={currentSubmissionIndex === submissions.length - 1}
            >
              Next
              <FiArrowRight className="w-4 h-4" />
            </SecondaryButton>
            <SecondaryButton variant="outline" onClick={onClose}>
              <FiX className="w-4 h-4" />
            </SecondaryButton>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Submission Content */}
          <div className="flex-1 flex flex-col border-r border-gray-200">
            {/* Student Info */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 mb-2">
                <FiUser className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">{currentSubmission.student?.name || "Student"}</h3>
                  <p className="text-sm text-gray-600">{currentSubmission.student?.email || "No email"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  Submitted: {new Date(currentSubmission.submittedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Submission Content */}
            <div className="flex-1 overflow-auto p-6">
              {currentSubmission.submissionType === "text_entry" && currentSubmission.submissionContent && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Text Submission</h4>
                  <div className="whitespace-pre-wrap text-gray-700">
                    {currentSubmission.submissionContent}
                  </div>
                </div>
              )}

              {currentSubmission.submissionType === "file_upload" && currentSubmission.submittedFile && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiFileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">{currentSubmission.submittedFile.name}</h4>
                        <p className="text-sm text-gray-600">
                          {(currentSubmission.submittedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {currentSubmission.submittedFile.file_type === "application/pdf" && (
                        <SecondaryButton
                          variant="outline"
                          onClick={() => setShowPdfViewer(!showPdfViewer)}
                        >
                          <FiEye className="w-4 h-4" />
                          {showPdfViewer ? "Hide" : "View"} PDF
                        </SecondaryButton>
                      )}
                    </div>
                  </div>

                  {/* PDF Viewer */}
                  {showPdfViewer && currentSubmission.submittedFile.file_type === "application/pdf" && (
                    <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: "600px" }}>
                      <iframe
                        src={`/api/files/view/${currentSubmission.submittedFile._id}`}
                        width="100%"
                        height="100%"
                        title="PDF Viewer"
                        className="border-0"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Grading */}
          <div className="w-96 flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Grading</h3>
            </div>

            {/* Scrollable Grading Content */}
            <div className="flex-1 overflow-auto p-6">
              {/* Rubric-based Grading */}
              {isRubricBased && (
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">Rubric Assessment</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {assignment.grading.rubric.criteria.map((criteria, criteriaIndex) => (
                    <div key={criteriaIndex} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">{criteria.description}</h5>
                      <p className="text-sm text-gray-600 mb-3">Max Points: {criteria.points}</p>

                      <div className="space-y-2">
                        {assignment.grading.rubric.level.map((level) => {
                          const points = Math.round((criteria.points * level.rank) / Math.max(...assignment.grading.rubric.level.map(l => l.rank)));
                          const isSelected = rubricGrades[criteriaIndex.toString()]?.levelRank === level.rank;

                          return (
                            <label
                              key={level.rank}
                              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? "border-primary-500 bg-primary-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`criteria-${criteriaIndex}`}
                                checked={isSelected}
                                onChange={() => handleRubricGradeChange(criteriaIndex, level.rank, points)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900">{level.description}</span>
                                  <span className="text-sm font-medium text-primary-600">{points} pts</span>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {/* Direct Grading */}
              {!isRubricBased && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade ({assignment.grading.type === "percentage" ? "%" : "Pass/Fail"})
                  </label>
                  <TextBox
                    value={grade}
                    onChange={setGrade}
                    placeholder={assignment.grading.type === "percentage" ? "0-100" : "Pass or Fail"}
                  />
                </div>
              )}

              {/* Grade Display for Rubric */}
              {isRubricBased && (
                <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary-900">Total Grade</span>
                    <span className="text-xl font-bold text-primary-900">{grade}%</span>
                  </div>
                  <div className="text-sm text-primary-600 mt-1">
                    {Object.values(rubricGrades).reduce((sum, rg) => sum + rg.points, 0)} / {totalPoints} points
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (Optional)
                </label>
                <TextArea
                  value={feedback}
                  onChange={setFeedback}
                  placeholder="Provide feedback to the student..."
                  rows={4}
                  maxLength={1000}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <PrimaryButton
                  onClick={handleSaveGrade}
                  disabled={isSubmitting || (!isRubricBased && !grade.trim())}
                  className="w-full"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Grade"}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
