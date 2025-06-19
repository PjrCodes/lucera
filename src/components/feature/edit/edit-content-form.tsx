"use client";
import React, { useState, useEffect } from "react";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { FileDropInput } from "@/components/core/inputs/file-drop-input";
import { TextArea } from "@/components/core/inputs/text-area";
import { Checkbox } from "@/components/core/inputs/checkbox";
import { Dropdown } from "@/components/core/inputs/dropdown";
import { TextBox } from "@/components/core/inputs/text-box";
import { Course, UserData } from "@/lib/schemas";
import { Session } from "next-auth";
import { useSearchParams } from "next/navigation";

const allTopics = [
  "Algebra",
  "Calculus",
  "Mechanics",
  "Thermodynamics",
  "World War II",
  "Ancient Civilizations",
];

interface EditContentFormProps {
  userData: UserData;
  session: Session;
  courses: Course[];
  contentId: string;
  existingContent?: any;
  isNew: boolean;
}

export default function EditContentForm({
  userData,
  session,
  courses,
  contentId,
  existingContent,
  isNew,
}: EditContentFormProps) {
  const searchParams = useSearchParams();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    disabled: boolean;
  } | null>(null);
  const [optionalFile, setOptionalFile] = useState<File | null>(null);

  // Load course and file info from query params or existing content
  useEffect(() => {
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
      setSelectedCourse(existingContent.courseId);
      setTitle(existingContent.title || "");
      setDescription(existingContent.description || "");
      setSelectedTopics(existingContent.topics || []);

      // Check if content has an associated file
      if (existingContent.fileName) {
        setUploadedFile({ name: existingContent.fileName, disabled: true });
      }
    }
  }, [isNew, existingContent, searchParams]);

  const inferTopics = () => {
    setIsInferring(true);
    setTimeout(() => {
      const shuffled = [...allTopics].sort(() => 0.5 - Math.random());
      setSelectedTopics(shuffled.slice(0, 2));
      setIsInferring(false);
    }, 1200);
  };

  const handleTopicChange = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save/update logic
    console.log("Saving content...", {
      contentId,
      selectedCourse,
      title,
      description,
      selectedTopics,
      file,
      isNew,
    });
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

          <div>
            <label className="block mb-2 font-medium">Title:</label>
            <TextBox
              value={title}
              onChange={setTitle}
              placeholder="Enter content title"
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
              {allTopics.map((topic) => (
                <label key={topic} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedTopics.includes(topic)}
                    onCheckedChange={() => handleTopicChange(topic)}
                  />
                  <span>{topic}</span>
                </label>
              ))}
            </div>
          </div>

          <PrimaryButton
            type="submit"
            className="px-4 py-2"
            disabled={!title || !description || selectedTopics.length === 0}
          >
            {isNew ? "Create Content" : "Update Content"}
          </PrimaryButton>
        </form>
      )}
    </div>
  );
}
