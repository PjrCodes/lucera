"use client";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { FileDropInput } from "@/components/core/inputs/file-drop-input";
import React from "react";

export default function CreateCoursePage() {
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [appStatus, setAppStatus] = React.useState<string>("started");
  const [error, setError] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);

  // Function to handle file upload
  async function uploadFile(
    evt:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    evt.preventDefault();

    const formData = new FormData();
    if (!file) {
      setError("No file selected");
      console.error("No file selected");
      return;
    }
    formData.append("file", file);
    setAppStatus("uploading");

    // Now, upload the syllabus file
    console.log("Uploading file:", file.name);


    let response = await fetch("/api/upload/syllabus", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log(result);
    if (response.ok) {
      setAppStatus("upload_success");
      setError(null);
    } else {
      setAppStatus("error");
      setError(result.error || "Failed to upload syllabus file.");
      console.error("File upload failed:", result.error);
    }

    // Now, call the magic course creation endpoint
    setAppStatus("processing_file");
    response = await fetch("/api/courses/magic-create", {
      method: "POST",
      body: JSON.stringify({ fileId: result.fileId }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorResult = await response.json();
      setAppStatus("error");
      setError(errorResult.error || "Failed to create course.");
      console.error("Course creation failed:", errorResult.error);
      return;
    }
    const courseResult = await response.json();
    if (courseResult.status === "success") {
      setAppStatus("course_created");
      // Redirect with success message as query param
      window.location.href = `/courses/edit/${courseResult.courseId}?type=success`;
    } else {
      // Redirect with error message as query param
      window.location.href = `/courses/edit/${courseResult.courseId}?type=error`;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDEB]">
      <div className="rounded-2xl shadow-lg px-8 py-10 w-full max-w-md bg-[#E6B7BE]">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#5C2A2B]">
          Create Course
        </h1>
        <form>
          <div className="mb-6">
            <label
              htmlFor="file"
              className="block mb-2 font-semibold text-base text-[#5C2A2B]"
            >
              Syllabus File (PDF)
            </label>
            <FileDropInput
              accept="application/pdf"
              file={file}
              onFileChange={setFile}
            />
            {file && (
              <div className="mt-1 text-sm text-[#5C2A2B]">
                Selected: {file.name}
              </div>
            )}
          </div>
          <SecondaryButton
            type="submit"
            onClick={uploadFile}
            disabled={!file || appStatus === "uploading" || appStatus === "processing_file"}
            className="mt-2 px-6 py-2 rounded-lg font-semibold text-base bg-[#EFCB7B] text-[#5C2A2B] border-2 border-[#EFCB7B] hover:bg-[#FFD580] hover:border-[#FFD580] transition-colors"
          >
            Submit
          </SecondaryButton>
          {error && (
            <p className="mt-4 text-red-700 font-medium">Error: {error}</p>
          )}
          {appStatus === "uploading" && (
            <p className="mt-4 text-[#5C2A2B]">Uploading syllabus...</p>
          )}
          {appStatus === "processing_file" && (
            <p className="mt-4 text-[#5C2A2B]">Processing file...</p>
          )}
          {appStatus === "upload_success" && (
            <p className="mt-4 text-green-700">Syllabus uploaded successfully!</p>
          )}
          {appStatus === "course_created" && (
            <p className="mt-4 text-green-700">Course created successfully!</p>
          )}
          {appStatus === "started" && (
            <p className="mt-4 text-[#5C2A2B]">
              Please upload your syllabus file to create a course.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
