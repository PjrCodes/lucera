"use client";
import React, { useState, useEffect } from "react";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { FileDropInput } from "@/components/core/inputs/file-drop-input";
import { TextArea } from "@/components/core/inputs/text-area";
import { Checkbox } from "@/components/core/inputs/checkbox";
import { Dropdown } from "@/components/core/inputs/dropdown";
import { TextBox } from "@/components/core/inputs/text-box";
import {
  Assignment,
  Course,
  CourseUnit,
  UserData,
} from "@/lib/schemas/database";
import { Session } from "next-auth";
import { useSearchParams } from "next/navigation";
import { ExtractedAssignment } from "@/lib/schemas/llm";
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

interface EditAssignmentFormProps {
  userData: UserData;
  session: Session;
  courses: Course[];
  contentId: string;
  existingContent: Assignment | null;
  isNew: boolean;
}

interface RubricCriteria {
  description: string;
  points: number;
}

interface RubricLevel {
  description: string;
  rank: number;
}

export default function EditAssignmentForm({
  // userData,
  // session,
  courses,
  contentId,
  existingContent,
  isNew,
}: EditAssignmentFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    disabled: boolean;
  } | null>(null);
  const [optionalFile, setOptionalFile] = useState<File | null>(null);

  // Assignment-specific fields
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [gradeReleaseDate, setGradeReleaseDate] = useState("");
  const [submissionType, setSubmissionType] = useState<
    "file_upload" | "text_entry"
  >("file_upload");
  const [gradingType, setGradingType] = useState<"percentage" | "pass_fail">(
    "percentage",
  );
  const [gradingMethod, setGradingMethod] = useState<"direct" | "rubric">(
    "direct",
  );
  const [totalPoints, setTotalPoints] = useState<number>(100);
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriteria[]>([
    { description: "", points: 0 },
  ]);
  const [rubricLevels, setRubricLevels] = useState<RubricLevel[]>([
    { description: "Excellent", rank: 4 },
    { description: "Good", rank: 3 },
    { description: "Satisfactory", rank: 2 },
    { description: "Needs Improvement", rank: 1 },
  ]);

  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Load assignment-specific data if it exists
      const assignmentData = existingContent as ExtractedAssignment; // Type assertion for assignment fields
      if (assignmentData.startDate) setStartDate(assignmentData.startDate);
      if (assignmentData.dueDate) setDueDate(assignmentData.dueDate);
      if (assignmentData.gradeReleaseDate)
        setGradeReleaseDate(assignmentData.gradeReleaseDate);
      if (assignmentData.submissionType)
        setSubmissionType(assignmentData.submissionType);
      if (assignmentData.grading) {
        setGradingType(assignmentData.grading.type || "percentage");
        setGradingMethod(assignmentData.grading.method || "direct");
        setTotalPoints(assignmentData.grading.total_points || 100);
        if (assignmentData.grading.rubric) {
          setRubricCriteria(
            assignmentData.grading.rubric.criteria || [
              { description: "", points: 0 },
            ],
          );
          setRubricLevels(
            assignmentData.grading.rubric.level || [
              { description: "Excellent", rank: 4 },
              { description: "Good", rank: 3 },
              { description: "Satisfactory", rank: 2 },
              { description: "Needs Improvement", rank: 1 },
            ],
          );
        }
      }

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

  const addRubricCriteria = () => {
    setRubricCriteria([...rubricCriteria, { description: "", points: 0 }]);
  };

  const removeRubricCriteria = (index: number) => {
    if (rubricCriteria.length > 1) {
      setRubricCriteria(rubricCriteria.filter((_, i) => i !== index));
    }
  };

  const updateRubricCriteria = (
    index: number,
    field: keyof RubricCriteria,
    value: string | number,
  ) => {
    const updated = [...rubricCriteria];
    updated[index] = { ...updated[index], [field]: value };
    setRubricCriteria(updated);
  };

  const addRubricLevel = () => {
    const newRank = Math.max(...rubricLevels.map((l) => l.rank)) + 1;
    setRubricLevels([...rubricLevels, { description: "", rank: newRank }]);
  };

  const removeRubricLevel = (index: number) => {
    if (rubricLevels.length > 1) {
      setRubricLevels(rubricLevels.filter((_, i) => i !== index));
    }
  };

  const updateRubricLevel = (
    index: number,
    field: keyof RubricLevel,
    value: string | number,
  ) => {
    const updated = [...rubricLevels];
    updated[index] = { ...updated[index], [field]: value };
    setRubricLevels(updated);
  };

  const isFormValid = () => {
    if (!title || !description || selectedTopics.length === 0) return false;
    if (gradingMethod === "rubric") {
      const hasValidCriteria = rubricCriteria.every(
        (c) => c.description.trim() && c.points > 0,
      );
      const hasValidLevels = rubricLevels.every((l) => l.description.trim());
      return hasValidCriteria && hasValidLevels;
    }
    return totalPoints > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        _id: isNew ? null : contentId,
        data: {
          title,
          description,
          courseId: selectedCourse,
          topics: selectedTopics.map((i) => i + 1), // Convert to 1-based indexes for backend
          fileId: null, // TODO: Handle file upload if needed
          startDate: startDate || null,
          dueDate: dueDate || null,
          gradeReleaseDate: gradeReleaseDate || null,
          submissionType,
          grading: {
            type: gradingType,
            method: gradingMethod,
            total_points: totalPoints,
            ...(gradingMethod === "rubric" && {
              rubric: {
                criteria: rubricCriteria,
                level: rubricLevels,
              },
            }),
          },
        },
      };

      const response = await fetch("/api/assignment/save", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          `Failed to save assignment: ${errorData.error || response.statusText}`,
        );
        setLoading(false);
        return;
      }

      const resp = await response.json();
      console.log("Success!", resp);

      // Redirect to assignments list or course page
      window.location.href = "/";
    } catch (err) {
      console.error("Error saving assignment:", err);
      setError("Failed to save assignment. Please try again.");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/delete/assignment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: contentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Failed to delete assignment");
        setDeleting(false);
        return;
      }
      setShowDeleteDialog(false);
      // Redirect to course assignments or home
      router.push("/");
    } catch (e) {
      if (!(e instanceof Error)) {
        setDeleteError("Unknown error while deleting assignment");
        setDeleting(false);
        return;
      }
      setDeleteError(e.message || "Unknown error");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? "Create Assignment" : "Edit Assignment"}
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
            <label className="block mb-2 font-medium">Title: *</label>
            <TextBox
              value={title}
              onChange={setTitle}
              placeholder="Enter assignment title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-medium">Start Date:</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Due Date:</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">
                Grade Release Date:
              </label>
              <input
                type="datetime-local"
                value={gradeReleaseDate}
                onChange={(e) => setGradeReleaseDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Submission Type: *</label>
            <Dropdown
              options={[
                { value: "file_upload", label: "File Upload" },
                { value: "text_entry", label: "Text Entry" },
              ]}
              value={submissionType}
              onChange={(value) =>
                setSubmissionType(value as "file_upload" | "text_entry")
              }
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
            <label className="block mb-2 font-medium">Description: *</label>
            <TextArea
              value={description}
              onChange={setDescription}
              placeholder="Describe the assignment..."
              rows={3}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Topics: *</label>
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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Grading Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 font-medium">
                  Grading Type: *
                </label>
                <Dropdown
                  options={[
                    { value: "percentage", label: "Percentage" },
                    { value: "pass_fail", label: "Pass/Fail" },
                  ]}
                  value={gradingType}
                  onChange={(value) =>
                    setGradingType(value as "percentage" | "pass_fail")
                  }
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Grading Method: *
                </label>
                <Dropdown
                  options={[
                    { value: "direct", label: "Direct Grading" },
                    { value: "rubric", label: "Rubric-based" },
                  ]}
                  value={gradingMethod}
                  onChange={(value) =>
                    setGradingMethod(value as "direct" | "rubric")
                  }
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Total Points: *
                </label>
                <TextBox
                  type="number"
                  value={totalPoints.toString()}
                  onChange={(value) => setTotalPoints(Number(value))}
                  placeholder="100"
                />
              </div>
            </div>

            {gradingMethod === "rubric" && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Rubric Criteria: *</h4>
                    <SecondaryButton
                      type="button"
                      onClick={addRubricCriteria}
                      className="text-sm px-3 py-1"
                    >
                      Add Criteria
                    </SecondaryButton>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            Description
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            Points
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rubricCriteria.map((criteria, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-3 py-2">
                              <TextBox
                                value={criteria.description}
                                onChange={(value) =>
                                  updateRubricCriteria(
                                    index,
                                    "description",
                                    value,
                                  )
                                }
                                placeholder="Criteria description"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <TextBox
                                type="number"
                                value={criteria.points.toString()}
                                onChange={(value) =>
                                  updateRubricCriteria(
                                    index,
                                    "points",
                                    Number(value),
                                  )
                                }
                                placeholder="0"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <SecondaryButton
                                type="button"
                                onClick={() => removeRubricCriteria(index)}
                                variant="outline"
                                className="text-sm px-2 py-1 text-red-600"
                                disabled={rubricCriteria.length === 1}
                              >
                                Remove
                              </SecondaryButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Performance Levels: *</h4>
                    <SecondaryButton
                      type="button"
                      onClick={addRubricLevel}
                      className="text-sm px-3 py-1"
                    >
                      Add Level
                    </SecondaryButton>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            Description
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            Rank
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rubricLevels.map((level, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-3 py-2">
                              <TextBox
                                value={level.description}
                                onChange={(value) =>
                                  updateRubricLevel(index, "description", value)
                                }
                                placeholder="Level description"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <TextBox
                                type="number"
                                value={level.rank.toString()}
                                onChange={(value) =>
                                  updateRubricLevel(
                                    index,
                                    "rank",
                                    Number(value),
                                  )
                                }
                                placeholder="1"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <SecondaryButton
                                type="button"
                                onClick={() => removeRubricLevel(index)}
                                variant="outline"
                                className="text-sm px-2 py-1 text-red-600"
                                disabled={rubricLevels.length === 1}
                              >
                                Remove
                              </SecondaryButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 items-center">
            <PrimaryButton
              type="submit"
              className="px-4 py-2"
              disabled={!isFormValid() || loading}
            >
              {loading
                ? "Saving..."
                : isNew
                  ? "Create Assignment"
                  : "Update Assignment"}
            </PrimaryButton>

            {!isNew && (
              <SecondaryButton
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="px-4 py-2 text-danger-600 hover:bg-danger-100 hover:text-danger-900 border-danger-200 hover:border-danger-300 focus-visible:ring-danger-500 transition"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Assignment
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
                Delete Assignment
              </DialogTitle>
              <DialogDescription className="text-danger-600">
                Are you sure you want to delete this assignment? This action
                cannot be undone.
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
