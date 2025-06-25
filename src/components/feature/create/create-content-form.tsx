"use client";
import React, { useState } from "react";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { FileDropInput } from "@/components/core/inputs/file-drop-input";
import { TextArea } from "@/components/core/inputs/text-area";
import { Checkbox } from "@/components/core/inputs/checkbox";
import { Dropdown } from "@/components/core/inputs/dropdown";
import { TextBox } from "@/components/core/inputs/text-box";
import { Course, UserData } from "@/lib/schemas/database";
import { Session } from "next-auth";

const allTopics = [
  "Algebra",
  "Calculus",
  "Mechanics",
  "Thermodynamics",
  "World War II",
  "Ancient Civilizations",
];

// Accept props from server component
export default function CreateContentPage({
  courses,
}: {
  userData: UserData;
  session: Session;
  courses: Course[];
}) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [isInferring, setIsInferring] = useState(false);

  // Simulate topic inference
  const inferTopics = () => {
    setIsInferring(true);
    setTimeout(() => {
      // Dummy inference: pick 2 random topics
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

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Course Content</h1>
      {!selectedCourse ? (
        <div>
          <label className="block mb-2 font-medium">Select a course:</label>
          <Dropdown
            options={courses.map((c) => ({ value: c._id.toString(), label: c.name }))}
            value={selectedCourse}
            onChange={setSelectedCourse}
            placeholder="-- Choose a course --"
          />
        </div>
      ) : (
        <form className="space-y-6">
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
            <PrimaryButton
              type="button"
              variant="outline"
              className="text-sm px-3 py-1"
              onClick={inferTopics}
              disabled={isInferring}
            >
              {isInferring ? "Inferring..." : "✨ Magic: Infer Topics"}
            </PrimaryButton>
          </div>
          <PrimaryButton
            type="submit"
            className="px-4 py-2"
            disabled={!file || !title || !description || selectedTopics.length === 0}
          >
            Submit
          </PrimaryButton>
        </form>
      )}
    </div>
  );
}
