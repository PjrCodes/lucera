"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  SubmittedAssignmentWithEmbeddedData,
  Assignment,
} from "@/lib/schemas/database";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { TextArea } from "@/components/core/inputs/text-area";
import { TextBox } from "@/components/core/inputs/text-box";
import { useAlertDialog } from "@/components/core/alert-dialog";
import PDFViewer from "@/components/core/pdf-viewer";
import {
  FiArrowLeft,
  FiArrowRight,
  FiSave,
  FiFileText,
  FiChevronLeft,
} from "react-icons/fi";

export default function GradeSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;
  const submissionId = params.submissionId as string;

  const {
    showError,
    AlertDialog,
  } = useAlertDialog();

  const [submissions, setSubmissions] = useState<
    SubmittedAssignmentWithEmbeddedData[]
  >([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [rubricGrades, setRubricGrades] = useState<{
    [key: string]: { levelRank: number; points: number };
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch submissions and assignment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch submissions for this assignment
        const submissionsResponse = await fetch(
          `/api/assignment/${assignmentId}/submissions`
        );
        if (!submissionsResponse.ok) {
          throw new Error("Failed to fetch submissions");
        }
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData.submissions || []);

        // Find current submission index
        const index = submissionsData.submissions.findIndex(
          (sub: SubmittedAssignmentWithEmbeddedData) =>
            sub._id.toString() === submissionId
        );
        if (index !== -1) {
          setCurrentSubmissionIndex(index);
          setAssignment(submissionsData.submissions[index].assignment);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId && submissionId) {
      fetchData();
    }
  }, [assignmentId, submissionId]);

  const currentSubmission = submissions[currentSubmissionIndex];
  const isRubricBased = assignment?.grading.method === "rubric";
  const totalPoints = assignment?.grading.total_points || 0;

  // Initialize rubric grades when submission changes
  useEffect(() => {
    if (currentSubmission && isRubricBased) {
      const initialRubricGrades: {
        [key: string]: { levelRank: number; points: number };
      } = {};

      if (currentSubmission.rubricGrades) {
        currentSubmission.rubricGrades.forEach((rg) => {
          initialRubricGrades[rg.criteriaIndex.toString()] = {
            levelRank: rg.levelRank,
            points: rg.points,
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
      const totalRubricPoints = Object.values(rubricGrades).reduce(
        (sum, rg) => sum + rg.points,
        0
      );
      const percentage = Math.round((totalRubricPoints / totalPoints) * 100);
      setGrade(percentage.toString());
    }
  }, [rubricGrades, isRubricBased, totalPoints]);

  const handleRubricGradeChange = (
    criteriaIndex: number,
    levelRank: number,
    points: number
  ) => {
    setRubricGrades((prev) => ({
      ...prev,
      [criteriaIndex.toString()]: { levelRank, points },
    }));
  };

  const handleSaveGrade = async () => {
    if (!currentSubmission) return;

    setIsSubmitting(true);
    try {
      const requestData = {
        grade: parseFloat(grade),
        feedback,
        rubricGrades: isRubricBased
          ? Object.entries(rubricGrades).map(([criteriaIndex, rg]) => ({
              criteriaIndex: parseInt(criteriaIndex),
              levelRank: rg.levelRank,
              points: rg.points,
            }))
          : undefined,
      };

      const response = await fetch(
        `/api/assignment/submissions/${currentSubmission._id}/grade`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save grade");
      }

      // Move to next submission if available
      if (currentSubmissionIndex < submissions.length - 1) {
        const nextSubmission = submissions[currentSubmissionIndex + 1];
        router.push(`/grade/${assignmentId}/${nextSubmission._id}`);
      } else {
        // Return to assignment submissions view
        router.push(`/view/assignment/${assignmentId}/submissions`);
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
      const prevSubmission = submissions[currentSubmissionIndex - 1];
      router.push(`/grade/${assignmentId}/${prevSubmission._id}`);
    }
  };

  const handleNextSubmission = () => {
    if (currentSubmissionIndex < submissions.length - 1) {
      const nextSubmission = submissions[currentSubmissionIndex + 1];
      router.push(`/grade/${assignmentId}/${nextSubmission._id}`);
    }
  };

  const handleBackToAssignment = () => {
    router.push(`/view/assignment/${assignmentId}/submissions`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error || !currentSubmission || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Submission not found"}</p>
          <SecondaryButton onClick={handleBackToAssignment}>
            Back to Submissions
          </SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertDialog />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
            <SecondaryButton
              variant="outline"
              onClick={handleBackToAssignment}
              className="w-fit"
            >
              <FiChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline ml-1">Back to Submissions</span>
              <span className="sm:hidden ml-1">Back</span>
            </SecondaryButton>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                {currentSubmission.student?.name || "Student"}
              </h1>
              <p className="text-sm text-gray-600 break-all">
                {currentSubmission.student?.email || "No email"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Submitted:{" "}
                {new Date(currentSubmission.submittedAt).toLocaleString()}
              </p>
            </div>
            <div className="bg-primary-100 px-3 py-1 rounded-full flex-shrink-0 w-fit">
              <span className="text-sm font-medium text-primary-700 whitespace-nowrap">
                {currentSubmissionIndex + 1} of {submissions.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <SecondaryButton
              variant="outline"
              onClick={handlePreviousSubmission}
              disabled={currentSubmissionIndex === 0}
              size="sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </SecondaryButton>
            <SecondaryButton
              variant="outline"
              onClick={handleNextSubmission}
              disabled={currentSubmissionIndex === submissions.length - 1}
              size="sm"
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <FiArrowRight className="w-4 h-4" />
            </SecondaryButton>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-0">
        {/* Left Panel - Submission Content */}
        <div className="flex-1 flex flex-col bg-white lg:border-r border-gray-200 min-h-0 lg:h-[calc(100vh-80px)]">
          {/* Submission Content */}
          <div className="flex-1 p-4 sm:p-6 min-h-[40vh] lg:min-h-0 lg:overflow-hidden">
            {currentSubmission.submissionType === "text_entry" &&
              currentSubmission.submissionContent && (
                <div className="bg-gray-50 p-4 rounded-lg max-h-full overflow-auto">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Text Submission
                  </h4>
                  <div className="whitespace-pre-wrap text-gray-700 break-words">
                    {currentSubmission.submissionContent}
                  </div>
                </div>
              )}

            {currentSubmission.submissionType === "file_upload" &&
              currentSubmission.submittedFile && (
                <div className="h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FiFileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 break-all">
                          {currentSubmission.submittedFile.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {(
                            currentSubmission.submittedFile.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PDF Viewer - Takes remaining space */}
                  {currentSubmission.submittedFile.file_type ===
                    "application/pdf" && (
                    <div className="flex-1 mt-4 min-h-0">
                      <PDFViewer
                        fileUrl={`/api/files/view/${currentSubmission.submittedFile._id}`}
                        readOnly={true}
                        preventCopy={true}
                        height="100%"
                        downloadDisabled={false}
                        onDownload={() =>
                          window.open(
                            `/api/files/download/${currentSubmission.submittedFile?._id}`,
                            "_blank"
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Right Panel - Grading */}
        <div className="w-full lg:w-96 flex flex-col bg-white min-h-0 lg:h-[calc(100vh-80px)] border-t lg:border-t-0 lg:border-l border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Grading
            </h3>
            <p className="text-sm text-gray-600 break-words">
              {assignment.title}
            </p>
          </div>

          {/* Scrollable Grading Content */}
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            {/* Rubric-based Grading */}
            {isRubricBased && assignment.grading.rubric && (
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-900">Rubric Assessment</h4>
                <div className="space-y-4">
                  {assignment.grading.rubric.criteria.map(
                    (criteria, criteriaIndex) => (
                      <div
                        key={criteriaIndex}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <h5 className="font-medium text-gray-900 mb-2 break-words">
                          {criteria.description}
                        </h5>
                        <p className="text-sm text-gray-600 mb-3">
                          Max Points: {criteria.points}
                        </p>

                        <div className="space-y-2">
                          {assignment.grading.rubric.level.map((level) => {
                            const points = Math.round(
                              (criteria.points * level.rank) /
                                Math.max(
                                  ...assignment.grading.rubric.level.map(
                                    (l) => l.rank
                                  )
                                )
                            );
                            const isSelected =
                              rubricGrades[criteriaIndex.toString()]
                                ?.levelRank === level.rank;

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
                                  onChange={() =>
                                    handleRubricGradeChange(
                                      criteriaIndex,
                                      level.rank,
                                      points
                                    )
                                  }
                                  className="mt-1 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <span className="font-medium text-gray-900 break-words">
                                      {level.description}
                                    </span>
                                    <span className="text-sm font-medium text-primary-600 flex-shrink-0">
                                      {points} pts
                                    </span>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Direct Grading */}
            {!isRubricBased && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade (
                  {assignment.grading.type === "percentage" ? "%" : "Pass/Fail"}
                  )
                </label>
                <TextBox
                  value={grade}
                  onChange={setGrade}
                  placeholder={
                    assignment.grading.type === "percentage"
                      ? "0-100"
                      : "Pass or Fail"
                  }
                />
              </div>
            )}

            {/* Grade Display for Rubric */}
            {isRubricBased && (
              <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-primary-900">
                    Total Grade
                  </span>
                  <span className="text-xl font-bold text-primary-900">
                    {grade}%
                  </span>
                </div>
                <div className="text-sm text-primary-600 mt-1">
                  {Object.values(rubricGrades).reduce(
                    (sum, rg) => sum + rg.points,
                    0
                  )}{" "}
                  / {totalPoints} points
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
                <FiSave className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {isSubmitting ? "Saving..." : "Save Grade & Continue"}
                </span>
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
