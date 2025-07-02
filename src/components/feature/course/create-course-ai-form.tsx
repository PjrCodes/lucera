"use client";
import React, { useState } from "react";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { FileDropInput } from "@/components/core/inputs/file-drop-input";
import { UserData } from "@/lib/schemas/database";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";

export default function CreateCourseAIForm(
  {
    // userData,
    // session,
  }: {
    userData: UserData;
    session: Session;
  },
) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleUploadAndProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      // Upload syllabus file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("content_type", "syllabus");
      // formData.append("userId", session.user.id || userData._id);

      const uploadResponse = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadResult.error || "Failed to upload syllabus file.",
        );
      }

      // Process with AI
      const processResponse = await fetch("/api/magic-create/course", {
        method: "POST",
        body: JSON.stringify({ fileId: uploadResult.fileId }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const processResult = await processResponse.json();

      if (!processResponse.ok) {
        throw new Error(processResult.error || "Failed to create course.");
      }

      // Redirect to edit page with the created course and file info
      if (processResult.status === "success") {
        router.push(
          `/edit/course/${processResult.courseId}?type=success&hasFile=true&fileName=${encodeURIComponent(file.name)}`,
        );
      } else {
        router.push(
          `/edit/course/${processResult.courseId}?type=error&hasFile=true&fileName=${encodeURIComponent(file.name)}`,
        );
      }
    } catch (error) {
      console.error("Error processing syllabus:", error);
      // Handle error - maybe show a toast or error message
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipToEdit = () => {
    router.push("/edit/course/new");
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Course</h1>

      <div className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">
            Upload Syllabus (PDF):
          </label>
          <FileDropInput
            accept="application/pdf"
            file={file}
            onFileChange={setFile}
            disabled={!!file || isProcessing}
          />
          {file && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Selected: {file.name}
              </span>
              <button
                onClick={() => setFile(null)}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                disabled={isProcessing}
              >
                Change file
              </button>
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
    </div>
  );
}
