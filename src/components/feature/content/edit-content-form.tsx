"use client";
import React, { useState, useEffect } from "react";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { FileDropInput } from "@/components/core/inputs/file-drop-input";
import { TextArea } from "@/components/core/inputs/text-area";
import { Checkbox } from "@/components/core/inputs/checkbox";
import { Dropdown } from "@/components/core/inputs/dropdown";
import { TextBox } from "@/components/core/inputs/text-box";
import { Content, Course, CourseUnit, UserData } from "@/lib/schemas/database";
import { Session } from "next-auth";
import { useSearchParams } from "next/navigation";
import { Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface EditContentFormProps {
  userData: UserData;
  session: Session;
  courses: Course[];
  contentId: string;
  existingContent: Content | null;
  isNew: boolean;
}

export default function EditContentForm({
  // userData,
  // session,
  courses,
  contentId,
  existingContent,
  isNew,
}: EditContentFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  // const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<"content" | "syllabus">("content");
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    disabled: boolean;
  } | null>(null);
  const [optionalFile, setOptionalFile] = useState<File | null>(null);

  // Add state for allTopics
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security features state
  const [blockDownload, setBlockDownload] = useState(false);
  const [blockChatbot, setBlockChatbot] = useState(false);

  // Delete-related states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load course and file info from query params or existing content
  useEffect(() => {
    if (!searchParams)
      throw new Error("Search params not available in new content form");
    if (isNew) {
      const courseId = searchParams.get("courseId");
      const hasFile = searchParams.get("hasFile") === "true";
      const fileName = searchParams.get("fileName");

      if (courseId) {
        setSelectedCourse(courseId);
      }

      if (hasFile && fileName) {
        setUploadedFile({ name: decodeURIComponent(fileName), disabled: true });
      } else {
        setUploadedFile(null);
      }
    } else if (existingContent) {
      setSelectedCourse(existingContent.courseId || null);
      setTitle(existingContent.title || "");
      setDescription(existingContent.description || "");
      setContentType(existingContent.type || "content");
      // Load security settings if available
      setBlockDownload(existingContent.blockDownload || false);
      setBlockChatbot(existingContent.blockChatbot || false);
      // Remove this incorrect line - let the second useEffect handle topic mapping
      // setSelectedTopics(existingContent.topics ? existingContent.topics.map((_, idx) => idx - 1) : []);

      const hasFile = searchParams.get("hasFile") === "true";
      const fileName = searchParams.get("fileName");

      if (hasFile && fileName) {
        setUploadedFile({ name: decodeURIComponent(fileName), disabled: true });
      } else {
        setUploadedFile(null);
      }
    }
  }, [isNew, existingContent, searchParams]);

  // Update allTopics when selectedCourse changes
  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find((c) => c._id.toString() === selectedCourse);
      if (course && Array.isArray(course.units)) {
        // Flatten all unit names as topics
        setAllTopics(course.units.map((u: CourseUnit) => u.name));
      } else {
        setAllTopics([]);
      }
    } else {
      setAllTopics([]);
    }
  }, [selectedCourse, courses]);

  // When allTopics or existingContent.topics changes, update selectedTopics to indexes
  useEffect(() => {
    if (
      !isNew &&
      existingContent &&
      Array.isArray(existingContent.topics) &&
      allTopics.length > 0
    ) {
      // Convert 1-based indexes to 0-based indexes
      const indexes = existingContent.topics
        .map((topicIndex: number) => topicIndex - 1)
        .filter((idx) => idx >= 0 && idx < allTopics.length);
      setSelectedTopics(indexes);
    }
  }, [allTopics, existingContent, isNew]);

  const handleTopicChange = (idx: number) => {
    setSelectedTopics((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      setLoading(false);
      return;
    }
    if (!selectedCourse) {
      setError("Course selection is required");
      setLoading(false);
      return;
    }
    if (selectedTopics.length === 0) {
      setError("At least one topic must be selected");
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        _id: isNew ? null : contentId,
        data: {
          title,
          description,
          shortDescription: existingContent?.shortDescription || "", // Keep existing AI-generated shortDescription
          type: contentType,
          courseId: selectedCourse,
          topics: selectedTopics.map((i) => i + 1), // Convert to 1-based indexes for backend
          fileId: null, // TODO: Handle file upload if needed
          // Security features
          blockDownload,
          blockChatbot,
        },
      };

      const response = await fetch("/api/content/save", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          `Failed to save content: ${errorData.error || response.statusText}`,
        );
        setLoading(false);
        return;
      }

      const resp = await response.json();
      console.log("Success!", resp);

      // Redirect to content list or course page
      window.location.href = "/";
    } catch (err) {
      console.error("Error saving content:", err);
      setError("Failed to save content. Please try again.");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/delete/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: contentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Failed to delete content");
        setDeleting(false);
        return;
      }
      setShowDeleteDialog(false);
      // Redirect to course content or home
      router.push("/");
    } catch (e) {
      if (!(e instanceof Error)) {
        setDeleteError("Unknown error while deleting content");
        setDeleting(false);
        return;
      }
      setDeleteError(e.message || "Unknown error");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? "Create Course Content" : "Edit Course Content"}
      </h1>

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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Course:</label>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {courses.find((c) => c._id.toString() === selectedCourse)?.name}
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

          <div>
            <label className="block mb-2 font-medium">Title:</label>
            <TextBox
              value={title}
              onChange={setTitle}
              placeholder="Enter content title"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Content Type:</label>
            <Dropdown
              options={[
                { value: "content", label: "Course Content" },
                { value: "syllabus", label: "Syllabus" },
              ]}
              value={contentType}
              onChange={(value) => setContentType(value as "content" | "syllabus")}
              placeholder="Select content type"
            />
          </div>

          {isNew && (
            <div>
              <label className="block mb-2 font-medium">
                Upload PDF {!uploadedFile ? "(Optional)" : ""}:
              </label>
              {uploadedFile ? (
                <div className="p-3 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Uploaded: {uploadedFile.name}
                  </div>
                </div>
              ) : (
                <FileDropInput
                  accept="application/pdf"
                  file={optionalFile}
                  onFileChange={setOptionalFile}
                />
              )}
              {optionalFile && (
                <div className="mt-1 text-sm text-gray-600">
                  Selected: {optionalFile.name}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">Description:</label>
            <TextArea
              value={description}
              onChange={setDescription}
              placeholder="Describe the content..."
              rows={3}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Topics:</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {allTopics.map((topic, idx) => (
                <label key={topic} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedTopics.includes(idx)}
                    onCheckedChange={() => handleTopicChange(idx)}
                  />
                  <span>{topic}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Security Options */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-3">Security Options</h3>
            <p className="text-sm text-yellow-700 mb-4">
              Control how students can access and interact with this content.
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={blockDownload}
                  onCheckedChange={setBlockDownload}
                />
                <div>
                  <span className="font-medium text-yellow-800">Block Download</span>
                  <p className="text-sm text-yellow-600">
                    Students can only view the content in a secure viewer, downloads are disabled
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={blockChatbot}
                  onCheckedChange={setBlockChatbot}
                />
                <div>
                  <span className="font-medium text-yellow-800">Block LISA Chatbot</span>
                  <p className="text-sm text-yellow-600">
                    This content will not be available for LISA chatbot queries
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <PrimaryButton
              type="submit"
              className="px-4 py-2"
              disabled={
                !title || !description || selectedTopics.length === 0 || loading
              }
            >
              {loading
                ? "Saving..."
                : isNew
                  ? "Create Content"
                  : "Update Content"}
            </PrimaryButton>

            {!isNew && (
              <SecondaryButton
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="px-4 py-2 text-danger-600 hover:bg-danger-100 hover:text-danger-900 border-danger-200 hover:border-danger-300 focus-visible:ring-danger-500 transition"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Content
              </SecondaryButton>
            )}
          </div>

          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}

      {!isNew && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-danger-700">
                Delete Content
              </DialogTitle>
              <DialogDescription className="text-danger-600">
                Are you sure you want to delete this content? This action cannot
                be undone.
                <br />
                Please type <b>DELETE</b> to confirm.
              </DialogDescription>
            </DialogHeader>
            <TextBox
              value={deleteInput}
              onChange={setDeleteInput}
              placeholder="Type DELETE to confirm"
              className="mt-2 border-danger-500 focus:outline-danger-700 focus:border-danger-700"
            />
            {deleteError && (
              <div className="text-danger-600 text-sm mt-2">{deleteError}</div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <SecondaryButton variant="outline" disabled={deleting}>
                  Cancel
                </SecondaryButton>
              </DialogClose>
              <SecondaryButton
                variant="default"
                onClick={handleDelete}
                disabled={deleteInput !== "DELETE" || deleting}
                className="bg-danger-600 border-danger-600 text-white hover:bg-danger-700 hover:border-danger-700 focus-visible:ring-danger-500 transition"
              >
                {deleting ? "Deleting..." : "Delete"}
              </SecondaryButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
