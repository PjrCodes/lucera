import { getAssignmentById } from "@/lib/database-service/assignment";
import { getCourseById } from "@/lib/database-service/courses";
import { getSubmissionData } from "@/lib/database-service/submitted-assignments";
import { notFound } from "next/navigation";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { isBookmarked as checkIfBookmarked } from "@/lib/database-service/bookmarks";
import AssignmentBookmarkButton from "@/components/feature/assignment/assignment-bookmark-button";
import AssignmentSubmissionForm from "@/components/feature/assignment/assignment-submission-form";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  Download,
  MessageSquare,
  Users,
  Pencil,
  BookOpen,
  File,
  Edit,
} from "lucide-react";

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
    const isBookmarked = await checkIfBookmarked(
      session.user.id,
      "assignment",
      assignment._id.toString()
    );
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
      <div className="min-h-screen bg-transparent p-4">
        <div className="space-y-4 md:space-y-6">
          {/* Header with back button and assignment info */}
          <div className="flex flex-col gap-4 bg-white rounded-xl shadow-sm border border-primary-200 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href={`/view/course/${course._id}`}
                  className="p-2 bg-primary-100 rounded-lg hover:bg-primary-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700" />
                </Link>
                <div className="p-2 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg h-12 w-12 flex items-center justify-center">
                  <div className="rounded flex items-center justify-center text-white font-bold text-xl">
                    A
                  </div>
                </div>
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-800">
                      {assignment.title}
                    </h1>
                    <div className="flex items-center gap-2">
                      {isOverdue && (
                        <span className="px-3 py-1 bg-danger-100 text-danger-800 text-sm font-medium rounded-full">
                          Overdue
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="px-3 py-1 bg-info-100 text-info-800 text-sm font-medium rounded-full">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-primary-600/80 text-xs sm:text-sm mt-1">
                    {course.name} • Assignment
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isTeacher && (
                  <>
                    <PrimaryButton size="sm" asChild>
                      <Link href={`/view/assignment/${assignment._id.toString()}/submissions`}>
                        <Users className="w-4 h-4 mr-1" />
                        View Submissions
                      </Link>
                    </PrimaryButton>
                    <PrimaryButton variant="outline" size="sm" asChild>
                      <Link href={`/edit/assignment/${assignment._id}`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </PrimaryButton>
                  </>
                )}
                <AssignmentBookmarkButton
                  assignmentId={assignment._id.toString()}
                  initialIsBookmarked={isBookmarked}
                />
              </div>
            </div>
          </div>

          {/* Assignment Description and Materials */}
          {(assignment.description || assignment.fileId) && (
            <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
                  <File className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary-800">
                    Assignment Materials
                  </h2>
                  <p className="text-sm text-primary-600">
                    Description, instructions, and downloadable resources
                  </p>
                </div>
              </div>
              {assignment.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary-800 mb-3">
                    Description
                  </h3>
                  <div className="prose prose-sm max-w-none text-primary-700 bg-primary-50/50 rounded-lg border border-primary-100 p-4">
                    {assignment.description.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-2 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignment File/Attachment */}
              {assignment.fileId && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-primary-800">
                      Assignment Materials
                    </h3>
                    {assignment.blockDownload && (
                      <span className="px-2 py-1 bg-danger-100 text-danger-600 text-xs rounded-full">
                        Download Blocked
                      </span>
                    )}
                    {assignment.blockChatbot && (
                      <span className="px-2 py-1 bg-warning-100 text-warning-600 text-xs rounded-full">
                        LISA Chat Blocked
                      </span>
                    )}
                  </div>

                  {assignment.blockDownload && !isTeacher ? (
                    // Secure viewer link for blocked downloads
                    <div className="flex items-center gap-3 p-4 bg-danger-50 rounded-lg border border-danger-200">
                      <div className="p-2 bg-danger-100 rounded-lg">
                        <FileText className="w-5 h-5 text-danger-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-danger-900">
                          Secure Document Access
                        </p>
                        <p className="text-sm text-danger-700">
                          Download is blocked. View in secure mode only.
                        </p>
                      </div>
                      <SecondaryButton asChild>
                        <a
                          href={`/view/document/${assignment.fileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Document
                        </a>
                      </SecondaryButton>
                    </div>
                  ) : (
                    // Normal download option for non-blocked files
                    <div className="flex items-center gap-3 p-4 bg-primary-50/50 rounded-lg border border-primary-100">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Download className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-primary-900">
                          Download Assignment File
                        </p>
                        <p className="text-sm text-primary-600">
                          Click to download the assignment materials
                        </p>
                      </div>
                      <SecondaryButton asChild>
                        <a
                          href={`/api/files/download/${assignment.fileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      </SecondaryButton>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Assignment Dates */}
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary-800">
                Assignment Dates
              </h2>
              <p className="text-sm text-primary-600">
                Important deadlines and timeline information
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary-50/50 p-4 rounded-lg border border-primary-100">
              <h3 className="text-sm font-medium text-primary-600 mb-1">
                Start Date
              </h3>
              <p className="text-sm text-primary-900 font-medium">
                {formatDate(assignment.startDate)}
              </p>
            </div>
            <div className="bg-primary-50/50 p-4 rounded-lg border border-primary-100">
              <h3 className="text-sm font-medium text-primary-600 mb-1">
                Due Date
              </h3>
              <p
                className={`text-sm font-medium ${
                  isOverdue ? "text-danger-600" : "text-primary-900"
                }`}
              >
                {formatDate(assignment.dueDate)}
              </p>
            </div>
            <div className="bg-primary-50/50 p-4 rounded-lg border border-primary-100">
              <h3 className="text-sm font-medium text-primary-600 mb-1">
                Grade Release
              </h3>
              <p className="text-sm text-primary-900 font-medium">
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
              <div className="bg-info-50/50 border border-info-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-info-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-info-800">
                      Your Grade
                    </h3>
                  </div>
                  <div className="bg-info-100 px-6 py-3 rounded-xl border border-info-300">
                    <span className="text-3xl font-bold text-info-700">
                      {studentSubmission.grade}%
                    </span>
                  </div>
                </div>

                {/* Grade Letter/Status */}
                <div className="mb-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-info-100 text-info-800">
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
                      <h4 className="text-lg font-medium text-info-800 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
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
                              className="bg-white p-4 rounded-lg border border-info-200 shadow-sm"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-primary-800 font-medium text-sm">
                                  {criteria?.description ||
                                    `Criteria ${rg.criteriaIndex + 1}`}
                                </span>
                                <span className="text-info-700 font-bold text-lg">
                                  {rg.points} / {criteria?.points || 0}
                                </span>
                              </div>
                              <div className="w-full bg-primary-200 rounded-full h-2">
                                <div
                                  className="bg-info-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-primary-600 mt-1">
                                {percentage}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-info-300 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-primary-800 flex items-center gap-2">
                            Total Score
                          </span>
                          <span className="text-xl font-bold text-info-700">
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
                  <div className="bg-white p-5 rounded-lg border border-info-200 shadow-sm">
                    <h4 className="text-lg font-medium text-info-800 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Teacher Feedback
                    </h4>
                    <p className="text-primary-700 whitespace-pre-wrap leading-relaxed">
                      {studentSubmission.feedback}
                    </p>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-info-200">
                  <div className="flex items-center gap-2 text-sm text-info-700">
                    <Clock className="w-4 h-4" />
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
            <div className="bg-info-50/50 border border-info-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-info-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-info-800">
                    Assignment Submitted
                  </p>
                  <p className="text-sm text-info-600">
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
            <div className="bg-danger-50/50 border border-danger-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-danger-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-danger-800">Not Submitted</p>
                    <p className="text-sm text-danger-600">
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

          {/* Description - moved from header */}
          <div>
            <h3 className="text-lg font-semibold text-primary-800 mb-3">
              Assignment Overview
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
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary-800">
                Grading Information
              </h2>
              <p className="text-sm text-primary-600">
                Assessment criteria and point distribution
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary-50/50 p-4 rounded-lg border border-primary-100">
              <h3 className="text-sm font-medium text-primary-600 mb-1">
                Grading Type
              </h3>
              <p className="text-sm text-primary-900 font-medium capitalize">
                {assignment.grading?.type || "N/A"}
              </p>
            </div>
            <div className="bg-primary-50/50 p-4 rounded-lg border border-primary-100">
              <h3 className="text-sm font-medium text-primary-600 mb-1">
                Total Points
              </h3>
              <p className="text-sm text-primary-900 font-medium">
                {assignment.grading?.total_points || 0} points
              </p>
            </div>
            <div className="bg-primary-50/50 p-4 rounded-lg border border-primary-100">
              <h3 className="text-sm font-medium text-primary-600 mb-1">
                Submission Type
              </h3>
              <p className="text-sm text-primary-900 font-medium capitalize">
                {assignment.submissionType?.replace("_", " ") || "N/A"}
              </p>
            </div>
          </div>

          {/* Rubric Display */}
          {assignment.grading?.method === "rubric" &&
            assignment.grading.rubric && (
              <div>
                <h3 className="text-lg font-semibold text-primary-800 mb-4">
                  Grading Rubric
                </h3>

                {/* Criteria Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border border-primary-200 rounded-lg">
                    <thead>
                      <tr className="bg-primary-50/50">
                        <th className="border-b border-primary-200 px-4 py-3 text-left text-sm font-medium text-primary-800">
                          Criteria
                        </th>
                        <th className="border-b border-primary-200 px-4 py-3 text-center text-sm font-medium text-primary-800">
                          Points
                        </th>
                        {assignment.grading.rubric.level
                          ?.sort((a, b) => b.rank - a.rank)
                          .map((level, index) => (
                            <th
                              key={index}
                              className="border-b border-primary-200 px-4 py-3 text-center text-sm font-medium text-primary-800"
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
                            className="border-b border-primary-100"
                          >
                            <td className="px-4 py-3 text-sm text-primary-900">
                              {criteria.description}
                            </td>
                            <td className="px-4 py-3 text-sm text-primary-900 font-medium text-center">
                              {criteria.points}
                            </td>
                            {assignment.grading.rubric.level
                              ?.sort((a, b) => b.rank - a.rank)
                              .map((level, levelIndex) => (
                                <td
                                  key={levelIndex}
                                  className="px-4 py-3 text-center"
                                >
                                  <div className="w-4 h-4 border border-primary-300 rounded mx-auto"></div>
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
          <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary-800">
                  Topics Covered
                </h2>
                <p className="text-sm text-primary-600">
                  Course units and topics addressed in this assignment
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {assignment.topics.map((topicIndex, index) => {
                const topicName =
                  course.units?.[topicIndex - 1]?.name || `Topic ${topicIndex}`;
                return (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full"
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
      </div>
    );
  } catch (error) {
    console.error("Error loading assignment:", error);
    notFound();
  }
}
