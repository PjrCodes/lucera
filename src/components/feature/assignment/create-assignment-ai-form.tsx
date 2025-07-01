"use client";
import React, { useState } from "react";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { FileDropInput } from "@/components/core/inputs/file-drop-input";
import { Dropdown } from "@/components/core/inputs/dropdown";
import { Course, UserData } from "@/lib/schemas/database";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";

export default function CreateAssignmentAIForm({
  // userData,
  // session,
  courses,
}: {
  userData: UserData;
  session: Session;
  courses: Course[];
}) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        setError(errorData.error || "Failed to upload assignment file.");
        // return;
      }

      const uploadResult = await result.json();
      if (!uploadResult.fileId) {
        setError("File upload failed. No fileId returned.");

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
        setError(errorData.error || "Failed to process content with AI.");
        // return;
      }

      const magicResult = await magicCreate.json();

      if (magicResult.status !== "success") {
        setError(magicResult.error || "AI processing failed.");
        return;
      }
      setError(null); // Clear any previous errors

      const resId = magicResult.contentId;
      console.log("AI processed content ID:", resId);
      // Redirect to edit page with AI-processed data and file info
      router.push(
        `/edit/assignment/${resId}?courseId=${selectedCourse}&hasFile=true&fileName=${encodeURIComponent(
          file.name
        )}`
      );
    } catch (error) {
      console.error("Error processing PDF:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipToEdit = () => {
    if (!selectedCourse) return;
    router.push(`/edit/assignment/new?courseId=${selectedCourse}&hasFile=false`);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create an Assignment</h1>

      {!selectedCourse ? (
        <div>
          <label className="block mb-2 font-medium">Select a course:</label>
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
            <div>
              <span className="text-red-600">Error: {error}</span>
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
  );
}
