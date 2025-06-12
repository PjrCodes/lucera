"use client";
import React from "react";

export default function CreateCoursePage() {
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [appStatus, setAppStatus] = React.useState<string>("started");
  const [error, setError] = React.useState<string | null>(null);

  // Function to handle file upload
  async function uploadFile(
    evt:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    evt.preventDefault();

    const formData = new FormData();
    if (!fileInput.current || !fileInput.current.files) {
      setError("File input is not available");
      console.error("File input is not available");
      return;
    }

    const file = fileInput.current.files[0];
    formData.append("file", file);
    if (!file) {
      console.error("No file selected");
      setError("No file selected");
      return;
    }
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-lucerabrown-1 rounded-xl shadow-lg px-8 py-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 tracking-tight">
          Create Course
        </h1>
        <form>
          <div className="mb-6">
            <label
              htmlFor="file"
              className="block mb-2 font-semibold text-gray-700 text-base"
            >
              Syllabus File (PDF, DOC, DOCX)
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 cursor-pointer mb-2"
              required
              ref={fileInput}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-lucerabrown-4 hover:bg-lucerabrown-3 text-white font-bold text-base rounded-md shadow transition-colors cursor-pointer"
            onClick={uploadFile}
          >
            Submit
          </button>
             {error && (
                <p className="mt-4 text-red-600">Error: {error}</p>
            )}
            {appStatus === "uploading" && (
                <p className="mt-4 text-blue-600">Uploading syllabus...</p>
            )}
            {appStatus === "processing_file" && (
                <p className="mt-4 text-blue-600">Processing file...</p>
            )}
            {appStatus === "upload_success" && (
                <p className="mt-4 text-green-600">Syllabus uploaded successfully!</p>
            )}
            {appStatus === "course_created" && (
                <p className="mt-4 text-green-600">Course created successfully!</p>
            )}
            {appStatus === "started" && (
                <p className="mt-4 text-gray-600">Please upload your syllabus file to create a course.</p>
            )}
        </form>
      </div>
    </div>
  );
}
