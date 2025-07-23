"use client";
import React, { useState, useEffect } from "react";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { FileDropInput } from "@/components/core/inputs/file-drop-input";
import { Dropdown } from "@/components/core/inputs/dropdown";
import { Course } from "@/lib/schemas/database";
import { useRouter } from "next/navigation";

type Props = {
  courses: Course[];
  defaultCourseId?: string;
};

export default function CreateAssignmentAIForm({
  courses,
  defaultCourseId,
}: Props) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (
      defaultCourseId &&
      courses.some((c) => c._id.toString() === defaultCourseId)
    ) {
      setSelectedCourse(defaultCourseId);
    }
  }, [defaultCourseId, courses]);

  const handleUploadAndProcess = async () => {
    if (!file || !selectedCourse) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("content_type", "assignment");

      // upload pdf
      const result = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      if (!result.ok) {
        const errorData = await result.json();
        console.error("[COMP/CREATE_ASSIGNMENT: FILE UPLOAD]", errorData);
        setError("File upload failed: " + errorData.error);
        return;
      }
      const uploadResult = await result.json();
      if (!uploadResult.fileId) {
        console.error(
          "[COMP/CREATE_ASSIGNMENT: FILE UPLOAD] No fileId returned",
          uploadResult
        );
        setError("File upload failed: No fileId returned.");
        return;
      }

      const magicCreate = await fetch("/api/magic-create/assignment", {
        method: "POST",
        body: JSON.stringify({
          fileId: uploadResult.fileId,
          courseId: selectedCourse,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!magicCreate.ok) {
        const errorData = await magicCreate.json();
        console.error("[COMP/CREATE_ASSIGNMENT: MAGIC CREATE]", errorData);
        setError("Failed to process content with AI: " + errorData.error);
        return;
      }

      const magicResult = await magicCreate.json();

      if (magicResult.status !== "success") {
        console.error("[COMP/CREATE_ASSIGNMENT: MAGIC RESULT]", magicResult);
        setError("Failed to process content with AI: " + magicResult.error);
        return;
      }

      setError(null); // Clear any previous errors
      const resId = magicResult.contentId;
      // Redirect to edit page with AI-processed data and file info
      router.push(
        `/edit/assignment/${resId}?courseId=${selectedCourse}&hasFile=true&fileName=${encodeURIComponent(
          file.name
        )}`
      );
    } catch (error) {
      console.error("Error processing PDF:", error);
      setError("An error occurred while processing the PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipToEdit = () => {
    if (!selectedCourse) return;
    router.push(
      `/edit/assignment/new?courseId=${selectedCourse}&hasFile=false`
    );
  };

  return (
    <div className="p-4 mx-auto flex flex-col flex-1">
      <div className="max-w-4xl w-full mx-auto">
        <h1 className="font-header text-2xl md:text-5xl font-bold text-primary-600 mb-8">
          Create an Assignment
        </h1>

        {!selectedCourse ? (
          <div>
            <label className="mb-2 font-medium">Select a course:</label>
            <Dropdown
              options={courses.map((c) => ({
                value: c._id.toString(),
                label: c.name,
              }))}
              value={selectedCourse}
              onChange={setSelectedCourse}
              placeholder="-- Choose a course --"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-medium">Course:</label>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {
                    courses.find((c) => c._id.toString() === selectedCourse)
                      ?.name
                  }
                </span>
                <SecondaryButton
                  type="button"
                  variant="outline"
                  className="text-sm px-2 py-1"
                  onClick={() => setSelectedCourse(null)}
                >
                  Change
                </SecondaryButton>
              </div>
            </div>

            {error && (
              <div className="bg-danger-100 border border-danger-200 text-danger-700 p-4 rounded-lg">
                <span>Error: {error}</span>
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium">Upload PDF:</label>
              <FileDropInput
                accept="application/pdf"
                file={file}
                onFileChange={setFile}
              />
              {file && (
                <div className="mt-1 text-sm text-gray-600">
                  Selected: {file.name}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <PrimaryButton
                onClick={handleUploadAndProcess}
                disabled={!file || isProcessing}
                className="w-full"
              >
                {isProcessing
                  ? "Processing with AI..."
                  : "✨ Upload & Process with AI"}
              </PrimaryButton>

              <div className="text-center text-sm text-gray-500">or</div>

              <SecondaryButton
                onClick={handleSkipToEdit}
                variant="outline"
                className="w-full"
              >
                Skip to Manual Entry
              </SecondaryButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
