import {
  AssignmentWithEmbeddedFile,
  Course,
} from "@/lib/schemas/database";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { FiDownload, FiArrowLeft } from "react-icons/fi";
import { Pencil } from "lucide-react";
import Link from "next/link";

interface AssignmentViewProps {
  assignment: AssignmentWithEmbeddedFile;
  course: Course;
  backUrl?: string;
  isTeacher?: boolean;
  onBack?: () => void;
}

export default function AssignmentView({
  assignment,
  course,
  onBack,
  isTeacher,
}: AssignmentViewProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };

  const isOverdue =
    assignment.dueDate && new Date(assignment.dueDate) < new Date();
  const isUpcoming =
    assignment.startDate && new Date(assignment.startDate) > new Date();

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Assignments
      </button>

      {/* Assignment Header */}
      <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-900 mb-2">
              {assignment.title}
            </h1>
            <p className="text-lg text-primary-600">{course.name}</p>
          </div>
          <div className="flex gap-2 items-center">
            {isOverdue && (
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Overdue
              </span>
            )}
            {isUpcoming && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Upcoming
              </span>
            )}
            {isTeacher && (
              <a
                href={`/edit/assignment/${assignment._id}`}
                className="ml-2"
                tabIndex={-1}
              >
                <SecondaryButton
                  variant="outline"
                  className="flex items-center gap-1 text-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </SecondaryButton>
              </a>
            )}
          </div>
        </div>

        {/* Assignment Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-primary-500 mb-1">
              Start Date
            </h3>
            <p className="text-sm text-primary-900">
              {formatDate(assignment.startDate)}
            </p>
          </div>
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-primary-500 mb-1">
              Due Date
            </h3>
            <p
              className={`text-sm font-medium ${
                isOverdue ? "text-red-600" : "text-primary-900"
              }`}
            >
              {formatDate(assignment.dueDate)}
            </p>
          </div>
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-primary-500 mb-1">
              Grade Release
            </h3>
            <p className="text-sm text-primary-900">
              {formatDate(assignment.gradeReleaseDate)}
            </p>
          </div>
        </div>

        {/* Assignment File */}
        {assignment.file && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {assignment.file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Assignment Instructions
                  </p>
                </div>
              </div>
              <SecondaryButton variant="outline" className="text-sm" asChild>
                <Link href={`/api/files/download/${assignment.file._id}`}>
                  <FiDownload className="w-4 h-4 mr-1" />
                  Download
                </Link>
              </SecondaryButton>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-primary-900 mb-3">
            Description
          </h3>
          <div className="prose prose-sm max-w-none text-primary-700">
            {assignment.description.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-2">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Grading Information */}
      <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
        <h2 className="text-xl font-semibold text-primary-900 mb-4">
          Grading Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-primary-500 mb-1">
              Grading Type
            </h3>
            <p className="text-sm text-primary-900 capitalize">
              {assignment.grading?.type || "N/A"}
            </p>
          </div>
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-primary-500 mb-1">
              Total Points
            </h3>
            <p className="text-sm text-primary-900">
              {assignment.grading?.total_points || 0} points
            </p>
          </div>
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-primary-500 mb-1">
              Submission Type
            </h3>
            <p className="text-sm text-primary-900 capitalize">
              {assignment.submissionType?.replace("_", " ") || "N/A"}
            </p>
          </div>
        </div>

        {/* Rubric Display */}
        {assignment.grading?.method === "rubric" &&
          assignment.grading.rubric && (
            <div>
              <h3 className="text-lg font-semibold text-primary-900 mb-4">
                Grading Rubric
              </h3>

              {/* Performance Levels */}
              <div className="mb-4">
                <h4 className="text-md font-medium text-primary-700 mb-2">
                  Performance Levels
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {assignment.grading.rubric.level
                    ?.sort((a, b) => b.rank - a.rank)
                    .map((level, index) => (
                      <div
                        key={index}
                        className="bg-primary-50 p-3 rounded-lg text-center"
                      >
                        <div className="text-sm font-medium text-primary-900">
                          {level.description}
                        </div>
                        <div className="text-xs text-primary-500">
                          Level {level.rank}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Criteria Table */}
              <div className="overflow-x-auto">
                <table className="w-full border border-primary-300 rounded-lg">
                  <thead>
                    <tr className="bg-primary-50">
                      <th className="border-b border-primary-300 px-4 py-3 text-left text-sm font-medium text-primary-900">
                        Criteria
                      </th>
                      <th className="border-b border-primary-300 px-4 py-3 text-left text-sm font-medium text-primary-900">
                        Points
                      </th>
                      {assignment.grading.rubric.level
                        ?.sort((a, b) => b.rank - a.rank)
                        .map((level, index) => (
                          <th
                            key={index}
                            className="border-b border-primary-300 px-4 py-3 text-center text-sm font-medium text-primary-900"
                          >
                            {level.description}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assignment.grading.rubric.criteria?.map(
                      (criteria, index) => (
                        <tr key={index} className="border-b border-primary-200">
                          <td className="px-4 py-3 text-sm text-primary-900">
                            {criteria.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-primary-900 font-medium">
                            {criteria.points}
                          </td>
                          {assignment.grading.rubric.level
                            ?.sort((a, b) => b.rank - a.rank)
                            .map((level, levelIndex) => (
                              <td
                                key={levelIndex}
                                className="px-4 py-3 text-center"
                              >
                                <div className="w-4 h-4 border border-primary-300 rounded"></div>
                              </td>
                            ))}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>

      {/* Topics Covered */}
      {assignment.topics && assignment.topics.length > 0 && (
        <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
          <h2 className="text-xl font-semibold text-primary-900 mb-4">
            Topics Covered
          </h2>
          <div className="flex flex-wrap gap-2">
            {assignment.topics.map((topicIndex, index) => {
              const topicName =
                course.units?.[topicIndex - 1]?.name || `Topic ${topicIndex}`;
              return (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                >
                  {topicName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Submission Section (only for students) */}
      {!isTeacher && (
        <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
          <h2 className="text-xl font-semibold text-primary-900 mb-4">
            Submit Assignment
          </h2>

          {assignment.submissionType === "file_upload" ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-primary-300 rounded-lg p-6 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-primary-400 mb-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-primary-600 mb-2">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-sm text-primary-500">
                  Supported formats: PDF, DOC, DOCX
                </p>
              </div>
              <div className="flex gap-2">
                <PrimaryButton className="flex-1">Upload File</PrimaryButton>
                <SecondaryButton variant="outline">Save Draft</SecondaryButton>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                className="w-full h-32 p-3 border border-primary-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your assignment submission here..."
              />
              <div className="flex gap-2">
                <PrimaryButton className="flex-1">Submit Text</PrimaryButton>
                <SecondaryButton variant="outline">Save Draft</SecondaryButton>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-primary-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm">
                <p className="font-medium text-primary-800">
                  Submission Reminder
                </p>
                <p className="text-primary-700">
                  {isOverdue
                    ? "This assignment is overdue. Late submissions may be penalized."
                    : assignment.dueDate
                    ? `This assignment is due ${formatDate(assignment.dueDate)}`
                    : "Make sure to submit your work before the deadline."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
