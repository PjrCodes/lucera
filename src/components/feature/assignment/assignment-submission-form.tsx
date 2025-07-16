"use client";

import { useState, useEffect } from "react";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { FileDropInput } from "@/components/core/inputs/file-drop-input";
import { TextArea } from "@/components/core/inputs/text-area";
import { Assignment, AssignmentWithEmbeddedFile } from "@/lib/schemas/database";
import { FiCheck, FiAlertTriangle } from "react-icons/fi";
import InstantFeedbackModal from "./instant-feedback-modal";

interface AssignmentSubmissionFormProps {
  assignment: Assignment | AssignmentWithEmbeddedFile;
  onSubmissionSuccess?: () => void;
}

export default function AssignmentSubmissionForm({
  assignment,
  onSubmissionSuccess,
}: AssignmentSubmissionFormProps) {
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });

  // Instant feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const isOverdue =
    assignment.dueDate && new Date(assignment.dueDate) < new Date();
  const isUpcoming =
    assignment.startDate && new Date(assignment.startDate) > new Date();

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        const response = await fetch(
          `/api/assignment/${assignment._id.toString()}/check-submission`
        );
        if (response.ok) {
          const data = await response.json();
          setHasSubmitted(data.hasSubmitted);
        }
      } catch (error) {
        console.error("Error checking submission status:", error);
      } finally {
        setCheckingSubmission(false);
      }
    };

    checkSubmissionStatus();
  }, [assignment._id]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      // Validate file type and size
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        setSubmissionStatus({
          type: "error",
          message: "Only PDF, DOC, and DOCX files are allowed.",
        });
        return;
      }

      if (file.size > maxSize) {
        setSubmissionStatus({
          type: "error",
          message: "File size must be less than 10MB.",
        });
        return;
      }

      setSubmissionStatus({ type: null, message: "" });
    }

    setSelectedFile(file);
  };

  const uploadFile = async (file: File): Promise<string> => {
    console.log(
      "Uploading file:",
      file.name,
      "Type:",
      file.type,
      "Size:",
      file.size
    );

    const formData = new FormData();
    formData.append("file", file);
    formData.append("content_type", "solved_assignment");

    const response = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    console.log("Upload response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Upload error:", errorData);
      throw new Error(errorData.error || "Failed to upload file");
    }

    const data = await response.json();
    console.log("Upload successful:", data.fileId);
    return data.fileId;
  };

  const handleSubmit = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (isUpcoming) {
      setSubmissionStatus({
        type: "error",
        message: "Assignment is not yet available for submission.",
      });
      return;
    }

    if (assignment.submissionType === "text_entry" && !submissionText.trim()) {
      setSubmissionStatus({
        type: "error",
        message: "Please enter your submission text.",
      });
      return;
    }

    if (assignment.submissionType === "file_upload" && !selectedFile) {
      setSubmissionStatus({
        type: "error",
        message: "Please select a file to upload.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus({ type: null, message: "" });

    try {
      let fileId = null;

      // Upload file if it's a file submission
      if (assignment.submissionType === "file_upload" && selectedFile) {
        fileId = await uploadFile(selectedFile);
      }

      // Submit assignment
      const submissionData = {
        assignmentId: assignment._id.toString(),
        submissionType: assignment.submissionType,
        submissionContent:
          assignment.submissionType === "text_entry"
            ? submissionText
            : undefined,
        fileId: fileId,
      };

      const response = await fetch("/api/assignment/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit assignment");
      }

      setSubmissionStatus({
        type: "success",
        message: "Assignment submitted successfully!",
      });

      // Reset form
      setSubmissionText("");
      setSelectedFile(null);

      // Call success callback if provided
      onSubmissionSuccess?.();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setSubmissionStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit assignment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantFeedback = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    // Validate input before getting feedback
    if (assignment.submissionType === "text_entry" && !submissionText.trim()) {
      setSubmissionStatus({
        type: "error",
        message: "Please enter your submission text before getting feedback.",
      });
      return;
    }

    if (assignment.submissionType === "file_upload" && !selectedFile) {
      setSubmissionStatus({
        type: "error",
        message: "Please select a file before getting feedback.",
      });
      return;
    }

    // Clear previous feedback
    setFeedbackText(null);
    setFeedbackError(null);
    setFeedbackLoading(true);
    setShowFeedbackModal(true);

    try {
      let fileId = null;

      // Upload file first if it's a file submission
      if (assignment.submissionType === "file_upload" && selectedFile) {
        fileId = await uploadFile(selectedFile);
      }

      // Prepare instant feedback request
      const feedbackData = {
        assignmentId: assignment._id.toString(),
        submissionType: assignment.submissionType,
        submissionContent:
          assignment.submissionType === "text_entry"
            ? submissionText
            : undefined,
        fileId: fileId,
      };

      const response = await fetch("/api/assignment/instant-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate instant feedback");
      }

      const result = await response.json();
      setFeedbackText(result.feedback);
    } catch (error) {
      console.error("Error getting instant feedback:", error);
      setFeedbackError(
        error instanceof Error
          ? error.message
          : "Failed to generate instant feedback"
      );
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleRetryFeedback = () => {
    handleInstantFeedback();
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
  };

  if (checkingSubmission) {
    return (
      <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-primary-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-primary-100 rounded mb-4"></div>
          <div className="h-10 bg-primary-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <FiCheck className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-primary-900 mb-2">
            Assignment Already Submitted
          </h3>
          <p className="text-primary-600 mb-4">
            You have already submitted this assignment. Your work is being
            reviewed by your instructor.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              If you need to make changes to your submission, please contact
              your instructor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submissionStatus.type === "success") {
    return (
      <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <FiCheck className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-primary-900 mb-2">
            Assignment Submitted Successfully!
          </h3>
          <p className="text-primary-600 mb-4">
            Your assignment has been submitted and will be reviewed by your
            instructor.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">{submissionStatus.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
      <h2 className="text-xl font-semibold text-primary-900 mb-4">
        Submit Assignment
      </h2>

      {assignment.submissionType === "file_upload" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Upload Assignment File
            </label>
            <FileDropInput
              accept=".pdf,.doc,.docx"
              file={selectedFile}
              onFileChange={handleFileChange}
              disabled={isSubmitting}
            />
            <p className="text-sm text-primary-500 mt-2">
              Supported formats: PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>

          {selectedFile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FiCheck className="w-5 h-5 text-green-600" />
                  <span className="text-primary-900 font-medium">
                    {selectedFile.name}
                  </span>
                </div>
                <span className="text-sm text-primary-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex gap-2">
                <SecondaryButton
                  variant="outline"
                  onClick={() => setSelectedFile(null)}
                  disabled={isSubmitting}
                >
                  Remove File
                </SecondaryButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Assignment Submission
            </label>
            <TextArea
              value={submissionText}
              onChange={setSubmissionText}
              placeholder="Enter your assignment submission here..."
              rows={6}
              maxLength={2000}
            />
            <div className="text-sm text-primary-500 mt-1">
              {submissionText.length}/2000 characters
            </div>
          </div>
        </div>
      )}

      {/* Submission Status Messages */}
      {(submissionStatus.type === "error" ||
        submissionStatus.type === "info") && (
        <div
          className={`mt-4 p-3 rounded-lg border ${
            submissionStatus.type === "error"
              ? "bg-red-50 border-red-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-start gap-2">
            {submissionStatus.type === "error" && (
              <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <p
              className={`text-sm ${
                submissionStatus.type === "error"
                  ? "text-red-800"
                  : "text-blue-800"
              }`}
            >
              {submissionStatus.message}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-6">
        <PrimaryButton
          className="flex-1"
          onClick={handleSubmit}
          disabled={isSubmitting || Boolean(isUpcoming)}
          type="button"
        >
          {isSubmitting ? "Submitting..." : "Submit Assignment"}
        </PrimaryButton>
        <SecondaryButton
          variant="outline"
          onClick={handleInstantFeedback}
          disabled={
            isSubmitting ||
            feedbackLoading ||
            (assignment.submissionType === "text_entry" && !submissionText.trim()) ||
            (assignment.submissionType === "file_upload" && !selectedFile)
          }
          type="button"
        >
          {feedbackLoading ? "Generating..." : "Get Feedback ✨"}
        </SecondaryButton>
      </div>

      {/* Submission Reminder */}
      <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
        <div className="flex items-start gap-2">
          <FiAlertTriangle className="w-5 h-5 text-primary-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary-800">Submission Reminder</p>
            <p className="text-primary-700">
              {isOverdue
                ? "This assignment is overdue. Late submissions may be penalized."
                : assignment.dueDate
                ? `This assignment is due ${new Date(
                    assignment.dueDate
                  ).toLocaleString()}`
                : "Make sure to submit your work before the deadline."}
            </p>
          </div>
        </div>
      </div>

      {/* Instant Feedback Modal */}
      <InstantFeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleCloseFeedbackModal}
        feedback={feedbackText}
        isLoading={feedbackLoading}
        error={feedbackError}
        onRetry={handleRetryFeedback}
      />
    </div>
  );
}
