import { getAssignmentById } from "@/lib/database-service/assignment";
import { getCourseById } from "@/lib/database-service/courses";
import {
  getSubmissionData,
} from "@/lib/database-service/submitted-assignments";
import { notFound } from "next/navigation";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { isBookmarked as checkIfBookmarked } from "@/lib/database-service/bookmarks";
import AssignmentBookmarkButton from "@/components/feature/assignment/assignment-bookmark-button";
import AssignmentSubmissionForm from "@/components/feature/assignment/assignment-submission-form";
import Link from "next/link";
import { FiUsers, FiDownload } from "react-icons/fi";
import { Pencil } from "lucide-react";

// TODO: add back button to course page

interface AssignmentPageProps {
  params: Promise<{
    assignment_id: string;
  }>;
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
  const resolvedParams = await params;
  const { session, userData } = await getSessionAndUserData();
  const isTeacher = userData.role === "teacher";

  try {
    const assignment = await getAssignmentById(resolvedParams.assignment_id);
    const course = await getCourseById(assignment.courseId);

    // Check if assignment is bookmarked (only for students)
    const isBookmarked = !isTeacher
      ? await checkIfBookmarked(
          session.user.id,
          "assignment",
          assignment._id.toString()
        )
      : false;

    // Get student's submission for this assignment (only for students)
    const studentSubmission = !isTeacher
      ? await getSubmissionData(assignment._id.toString(), session.user.id)
      : null;

    const formatDate = (dateString: string | null) => {
      if (!dateString) return "Not set";
      return new Date(dateString).toLocaleString();
    };

    const isOverdue =
      assignment.dueDate && new Date(assignment.dueDate) < new Date();
    const isUpcoming =
      assignment.startDate && new Date(assignment.startDate) > new Date();

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Back Button */}
        <div className="mb-4">
          <Link href={`/view/course/${course._id}`} className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-900 font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course
          </Link>
        </div>
        {/* Header */}
        <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 mb-2">
                {assignment.title}
              </h1>
              <p className="text-lg text-primary-600">{course.name}</p>
            </div>
            <div className="flex gap-2 items-center">
              {!isTeacher && (
                <AssignmentBookmarkButton
                  assignmentId={assignment._id.toString()}
                  initialIsBookmarked={isBookmarked}
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
                  <Link
                    href={`/view/assignment/${assignment._id.toString()}/submissions`}
                  >
                    <SecondaryButton variant="outline" size="sm">
                      <FiUsers className="w-4 h-4 mr-1" />
                      View Submissions
                    </SecondaryButton>
                  </Link>
                  <Link href={`/edit/assignment/${assignment._id}`}>
                    <SecondaryButton
                      variant="outline"
                      className="flex items-center gap-1 text-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </SecondaryButton>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Description */}
          {assignment.description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{assignment.description}</p>
            </div>
          )}

          {/* Assignment File/Attachment */}
          {assignment.fileId && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium text-gray-700">Assignment Materials</h3>
                {assignment.blockDownload && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                    Download Blocked
                  </span>
                )}
                {assignment.blockChatbot && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                    LISA Chat Blocked
                  </span>
                )}
              </div>

              {assignment.blockDownload && !isTeacher ? (
                // Secure viewer link for blocked downloads
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="font-medium text-red-900">Secure Document Access</p>
                    <p className="text-sm text-red-700">Download is blocked. View in secure mode only.</p>
                  </div>
                  <a
                    href={`/view/document/${assignment.fileId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    View Document
                  </a>
                </div>
              ) : (
                // Normal download option for non-blocked files
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                  <FiDownload className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Download Assignment File</p>
                    <p className="text-sm text-gray-600">Click to download the assignment materials</p>
                  </div>
                  <a
                    href={`/api/files/download/${assignment.fileId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assignment Dates */}
        <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
          <h2 className="text-xl font-semibold text-primary-900 mb-4">
            Assignment Dates
          </h2>
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

          {/* Published Grade Section - Only for students */}
          {!isTeacher &&
            studentSubmission &&
            assignment.gradesPublished &&
            studentSubmission.grade !== null &&
            studentSubmission.grade !== undefined && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-green-900">
                      Your Grade
                    </h3>
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-green-200 px-6 py-3 rounded-xl border border-green-300">
                    <span className="text-3xl font-bold text-green-800">
                      {studentSubmission.grade}%
                    </span>
                  </div>
                </div>

                {/* Grade Letter/Status */}
                <div className="mb-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {studentSubmission.grade >= 90
                      ? "A"
                      : studentSubmission.grade >= 80
                      ? "B"
                      : studentSubmission.grade >= 70
                      ? "C"
                      : studentSubmission.grade >= 60
                      ? "D"
                      : "F"}
                    {studentSubmission.grade >= 60
                      ? " - Passing"
                      : " - Needs Improvement"}
                  </div>
                </div>

                {/* Rubric Breakdown */}
                {studentSubmission.rubricGrades &&
                  studentSubmission.rubricGrades.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-green-800 mb-3 flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Grade Breakdown
                      </h4>
                      <div className="space-y-3">
                        {studentSubmission.rubricGrades.map((rg, index) => {
                          const criteria =
                            assignment.grading.rubric?.criteria[
                              rg.criteriaIndex
                            ];
                          const percentage = criteria
                            ? Math.round((rg.points / criteria.points) * 100)
                            : 0;
                          return (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg border border-green-200 shadow-sm"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-800 font-medium text-sm">
                                  {criteria?.description ||
                                    `Criteria ${rg.criteriaIndex + 1}`}
                                </span>
                                <span className="text-green-700 font-bold text-lg">
                                  {rg.points} / {criteria?.points || 0}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {percentage}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-300 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">

                            Total Score
                          </span>
                          <span className="text-xl font-bold text-green-700">
                            {studentSubmission.rubricGrades.reduce(
                              (sum, rg) => sum + rg.points,
                              0
                            )}{" "}
                            / {assignment.grading.total_points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Teacher Feedback */}
                {studentSubmission.feedback && (
                  <div className="bg-white p-5 rounded-lg border border-green-200 shadow-sm">
                    <h4 className="text-lg font-medium text-green-800 mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Teacher Feedback
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {studentSubmission.feedback}
                    </p>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-green-200">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      Graded on{" "}
                      {new Date(studentSubmission.gradedAt!).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Submission Status for students who haven't been graded yet */}
          {!isTeacher && studentSubmission && !assignment.gradesPublished && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-blue-900">
                    Assignment Submitted
                  </p>
                  <p className="text-sm text-blue-700">
                    Submitted on{" "}
                    {new Date(studentSubmission.submittedAt).toLocaleString()}
                    {studentSubmission.grade !== null &&
                    studentSubmission.grade !== undefined
                      ? " • Graded"
                      : " • Pending Review"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Not submitted yet - Only for students */}
          {!isTeacher && !studentSubmission && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-orange-900">Not Submitted</p>
                    <p className="text-sm text-orange-700">
                      {isOverdue
                        ? "This assignment is overdue. You can still submit, but it may be marked as late."
                        : assignment.dueDate
                        ? `Due ${formatDate(assignment.dueDate)}`
                        : "Submit your assignment when ready."}
                    </p>
                  </div>
                </div>
                <PrimaryButton className="ml-4">
                  Submit Assignment
                </PrimaryButton>
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
                          <tr
                            key={index}
                            className="border-b border-primary-200"
                          >
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

        {/* Submission Section - Only for students who haven't submitted */}
        {!isTeacher && (
          <AssignmentSubmissionForm
            assignment={JSON.parse(JSON.stringify(assignment))}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading assignment:", error);
    notFound();
  }
}
