"use client";

import { AssignmentWithEmbeddedFile, Course } from "@/lib/schemas/database";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { FiArrowLeft, FiUsers, FiDownload } from "react-icons/fi";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AssignmentBookmarkButton from "@/components/feature/assignment/assignment-bookmark-button";
import AssignmentSubmissionForm from "@/components/feature/assignment/assignment-submission-form";

interface AssignmentViewProps {
  assignment: AssignmentWithEmbeddedFile;
  course: Course;
  backUrl?: string;
  isTeacher?: boolean;
  showBookmarkButton?: boolean;
  initialIsBookmarked?: boolean;
  onBackToList?: () => void; // For tab context - doesn't involve server components
}

export default function AssignmentView({
  assignment,
  course,
  backUrl,
  isTeacher,
  showBookmarkButton = false,
  initialIsBookmarked = false,
  onBackToList,
}: AssignmentViewProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackToList) {
      onBackToList();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };
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
        onClick={handleBack}
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
            {showBookmarkButton && (
              <AssignmentBookmarkButton
                assignmentId={assignment._id.toString()}
                initialIsBookmarked={initialIsBookmarked}
              />
            )}
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
              <div className="flex gap-2">
                <Link href={`/view/assignment/${assignment._id.toString()}/submissions`}>
                  <SecondaryButton variant="outline" size="sm">
                    <FiUsers className="w-4 h-4 mr-1" />
                    View Submissions
                  </SecondaryButton>
                </Link>
                <a
                  href={`/edit/assignment/${assignment._id}`}
                  className=""
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
              </div>
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
              {!assignment.blockDownload || isTeacher ? (
                <SecondaryButton variant="outline" className="text-sm" asChild>
                  <Link href={`/api/files/download/${assignment.file._id}`}>
                    <FiDownload className="w-4 h-4 mr-1" />
                    Download
                  </Link>
                </SecondaryButton>
              ) : (
                <div className="flex items-center gap-2">
                  <SecondaryButton variant="outline" className="text-sm" asChild>
                    <Link href={`/view/document/${assignment.file._id}`} target="_blank">
                      <FiDownload className="w-4 h-4 mr-1" />
                      View (Secure)
                    </Link>
                  </SecondaryButton>
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    Download Blocked
                  </span>
                </div>
              )}
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

              {/* Performance Levels
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
              </div> */}

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
                      ),
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
        <AssignmentSubmissionForm
          assignment={assignment}
          onSubmissionSuccess={() => {
            // Optional: refresh page or show success state
            console.log("Assignment submitted successfully!");
          }}
        />
      )}
    </div>
  );
}
