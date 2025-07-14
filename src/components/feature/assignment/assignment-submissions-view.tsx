"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SubmittedAssignmentWithEmbeddedData, Assignment, Course } from "@/lib/schemas/database";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { useAlertDialog } from "@/components/core/alert-dialog";
import {
  FiArrowLeft,
  FiDownload,
  FiUser,
  FiCalendar,
  FiCheck,
  FiClock,
  FiFileText,
  FiSend
} from "react-icons/fi";

interface AssignmentSubmissionsViewProps {
  assignmentId: string;
}

export default function AssignmentSubmissionsView({
  assignmentId,
}: AssignmentSubmissionsViewProps) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmittedAssignmentWithEmbeddedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [publishingGrades, setPublishingGrades] = useState(false);

  const {
    showError,
    showConfirm,
    showSuccess,
    AlertDialog,
  } = useAlertDialog();

  const handleBack = () => {
    router.push(`/view/assignment/${assignmentId}`);
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/assignment/${assignmentId}/submissions`);

        if (!response.ok) {
          throw new Error("Failed to fetch submissions");
        }

        const data = await response.json();
        setSubmissions(data.submissions || []);

        // Set assignment and course from first submission
        if (data.submissions && data.submissions.length > 0) {
          setAssignment(data.submissions[0].assignment);
          setCourse(data.submissions[0].course);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();

    // Refetch when page becomes visible (user returns from grading page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSubmissions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchSubmissions);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchSubmissions);
    };
  }, [assignmentId]);

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/files/download/${fileId}`);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      showError("Download Failed", "Failed to download file. Please try again.");
    }
  };

  const handleGradeSubmission = (submissionIndex: number) => {
    const submission = submissions[submissionIndex];
    if (submission) {
      router.push(`/grade/${assignmentId}/${submission._id}`);
    }
  };

  const handlePublishGrades = async () => {
    if (!assignment) return;

    const hasGradedSubmissions = submissions.some(s => s.grade !== undefined);
    if (!hasGradedSubmissions) {
      showError("No Grades Available", "No grades to publish. Please grade at least one submission first.");
      return;
    }

    showConfirm(
      "Publish Grades",
      "Are you sure you want to publish grades? Students will be able to see their grades after this action.",
      async () => {
        setPublishingGrades(true);
        try {
          const response = await fetch(`/api/assignment/${assignmentId}/publish-grades`, {
            method: "POST",
          });

          if (!response.ok) {
            throw new Error("Failed to publish grades");
          }

          // Update assignment state
          setAssignment(prev => prev ? { ...prev, gradesPublished: true } : null);
          showSuccess("Grades Published", "Grades have been published successfully! Students can now view their grades.");
        } catch (error) {
          console.error("Error publishing grades:", error);
          showError("Publishing Failed", "Failed to publish grades. Please try again.");
        } finally {
          setPublishingGrades(false);
        }
      },
      {
        confirmText: "Publish Grades",
        cancelText: "Cancel"
      }
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  const getSubmissionStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <FiClock className="w-4 h-4 text-yellow-600" />;
      case "graded":
        return <FiCheck className="w-4 h-4 text-green-600" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSubmissionStatusText = (status: string) => {
    switch (status) {
      case "submitted":
        return "Awaiting Review";
      case "graded":
        return "Graded";
      default:
        return "Unknown";
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "graded":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-primary-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-primary-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Assignment
        </button>

        <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-2">Error Loading Submissions</div>
            <p className="text-primary-600 mb-4">{error}</p>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AlertDialog />
      {/* Back Navigation */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Assignment
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow border border-primary-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-900 mb-2">
              Assignment Submissions
            </h1>
            {assignment && (
              <div className="space-y-1">
                <p className="text-base sm:text-lg text-primary-600 break-words">{assignment.title}</p>
                <p className="text-sm text-primary-500 break-words">{course?.name}</p>
              </div>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-primary-900">
              {submissions.length}
            </div>
            <div className="text-sm text-primary-500">
              Total Submissions
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <FiClock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg font-semibold text-yellow-900">
                  {submissions.filter(s => s.status === "submitted").length}
                </div>
                <div className="text-sm text-yellow-700">Awaiting Review</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg font-semibold text-green-900">
                  {submissions.filter(s => s.status === "graded").length}
                </div>
                <div className="text-sm text-green-700">Graded</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Grades Section */}
      {assignment && submissions.length > 0 && (
        <div className="bg-white rounded-xl shadow border border-primary-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Grade Management</h3>
              <p className="text-sm text-gray-600 mt-1 break-words">
                {assignment.gradesPublished
                  ? "Grades have been published and are visible to students"
                  : "Grades are not yet published. Students cannot see their grades until published."
                }
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              {assignment.gradesPublished ? (
                <div className="flex items-center gap-2 text-green-600">
                  <FiCheck className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Grades Published</span>
                </div>
              ) : (
                <PrimaryButton
                  onClick={handlePublishGrades}
                  disabled={publishingGrades || !submissions.some(s => s.grade !== undefined)}
                  className="w-full sm:w-auto"
                >
                  <FiSend className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{publishingGrades ? "Publishing..." : "Publish Grades"}</span>
                </PrimaryButton>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="bg-white rounded-xl shadow border border-primary-100 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-primary-900 mb-6">
          Student Submissions
        </h2>

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <FiFileText className="mx-auto w-12 h-12 text-primary-300 mb-4" />
            <h3 className="text-lg font-medium text-primary-600 mb-2">
              No Submissions Yet
            </h3>
            <p className="text-primary-500 px-4">
              Students haven&apos;t submitted any work for this assignment yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission._id.toString()}
                className="border border-primary-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <FiUser className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-primary-900 break-words">
                          {submission.student?.name || "Student"}
                        </h3>
                        <p className="text-sm text-primary-500 break-all">
                          {submission.student?.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-primary-600 mb-3">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words">Submitted: {formatDate(submission.submittedAt)}</span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getSubmissionStatusColor(submission.status)} w-fit`}>
                        {getSubmissionStatusIcon(submission.status)}
                        <span className="whitespace-nowrap">{getSubmissionStatusText(submission.status)}</span>
                      </div>
                    </div>

                    {/* Submission Content Preview */}
                    {submission.submissionType === "text_entry" && submission.submissionContent && (
                      <div className="bg-primary-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-primary-700 line-clamp-3 break-words">
                          {submission.submissionContent}
                        </p>
                      </div>
                    )}

                    {submission.submissionType === "file_upload" && submission.submittedFile && (
                      <div className="bg-primary-50 p-3 rounded-lg mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FiFileText className="w-4 h-4 text-primary-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-primary-700 break-all">
                              {submission.submittedFile.name}
                            </span>
                            <span className="text-xs text-primary-500 ml-2 whitespace-nowrap">
                              ({(submission.submittedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Grade Display */}
                    {submission.grade !== undefined && (
                      <div className="bg-green-50 p-3 rounded-lg mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-sm font-medium text-green-800">
                            Grade: {submission.grade}%
                          </span>
                          {submission.feedback && (
                            <span className="text-xs text-green-600">
                              Feedback provided
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 lg:ml-4 flex-shrink-0">
                    {submission.submissionType === "file_upload" && submission.submittedFile && (
                      <SecondaryButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadFile(
                          submission.submittedFile!._id!.toString(),
                          submission.submittedFile!.name
                        )}
                        className="flex-1 lg:flex-none"
                      >
                        <FiDownload className="w-4 h-4 lg:mr-0 sm:mr-2" />
                        <span className="lg:hidden">Download</span>
                      </SecondaryButton>
                    )}
                    <SecondaryButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const submissionIndex = submissions.findIndex(s => s._id === submission._id);
                        handleGradeSubmission(submissionIndex);
                      }}
                      className="flex-1 lg:flex-none"
                    >
                      <span className="truncate">{submission.status === "submitted" ? "Grade" : "Review"}</span>
                    </SecondaryButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
