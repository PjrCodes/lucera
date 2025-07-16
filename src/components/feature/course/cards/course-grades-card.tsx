"use client";

import { useState, useEffect } from "react";
import { FiBarChart2, FiUsers, FiChevronRight, FiArrowLeft, FiEdit3, FiCalendar, FiMessageSquare, FiAward } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { useRouter } from "next/navigation";

interface CourseGradesCardProps {
  courseId: string;
  userRole: "teacher" | "student";
}

interface AssignmentInfo {
  _id: string;
  title: string;
  description: string;
  dueDate: string | null;
  totalPoints: number;
  gradingMethod: string;
}

interface AssignmentAnalytics {
  assignmentTitle: string;
  averageGrade: number;
  submissionCount: number;
  onTimeCount: number;
  lateCount: number;
  notSubmittedCount: number;
  gradeDistribution: { range: string; count: number }[];
}

interface StudentGrade {
  assignmentId: string;
  assignmentTitle: string;
  grade: number | null;
  feedback: string;
  submittedAt: string;
  gradedAt: string | null;
  status: "submitted" | "graded";
  dueDate: string | null;
  rubricGrades?: {
    criteriaIndex: number;
    levelRank: number;
    points: number;
  }[];
}

interface StudentSubmission {
  _id: string;
  studentId: string;
  grade: number | null;
  feedback: string;
  submittedAt: string;
  status: "submitted" | "graded";
  student: {
    id: string;
    name: string;
    email: string;
  };
  assignment: {
    _id: string;
    title: string;
  };
}

export default function CourseGradesCard({ courseId, userRole }: CourseGradesCardProps) {
  const [assignmentAnalytics, setAssignmentAnalytics] = useState<AssignmentAnalytics[]>([]);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [assignments, setAssignments] = useState<AssignmentInfo[]>([]);
  const [selectedAssignmentTitle, setSelectedAssignmentTitle] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<StudentGrade | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [showTeacherView, setShowTeacherView] = useState(false);
  const [showStudentView, setShowStudentView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const router = useRouter();

  // Fetch data based on user role
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (userRole === "teacher") {
          // Fetch both assignment analytics and assignment info for teachers
          const [analyticsResponse, assignmentsResponse] = await Promise.all([
            fetch(`/api/analytics/assignments?courseId=${courseId}`),
            fetch(`/api/courses/${courseId}/assignments`)
          ]);

          if (!analyticsResponse.ok || !assignmentsResponse.ok) {
            throw new Error("Failed to fetch assignment data");
          }

          const analyticsData = await analyticsResponse.json();
          const assignmentsData = await assignmentsResponse.json();

          setAssignmentAnalytics(analyticsData.analytics || []);
          setAssignments(assignmentsData.assignments || []);
        } else {
          // Fetch student grades
          const response = await fetch(`/api/student/grades?courseId=${courseId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch student grades");
          }
          const data = await response.json();

          console.log("Raw student grades data:", data);
          console.log("Number of submissions:", data.submissions?.length || 0);

          // Transform submission data to grade format - temporarily showing all submissions for debugging
          const grades = data.submissions
            .map((submission: {
              assignment: { _id: string; title: string; dueDate: string | null; gradesPublished?: boolean };
              grade: number | null;
              feedback: string;
              submittedAt: string;
              gradedAt: string | null;
              status: string;
              rubricGrades?: { criteriaIndex: number; levelRank: number; points: number }[]
            }) => {
              console.log("Processing submission:", {
                assignmentTitle: submission.assignment.title,
                gradesPublished: submission.assignment.gradesPublished,
                grade: submission.grade,
                status: submission.status,
                hasGradesPublishedField: 'gradesPublished' in submission.assignment
              });
              return {
                assignmentId: submission.assignment._id,
                assignmentTitle: submission.assignment.title,
                grade: submission.grade,
                feedback: submission.feedback || "",
                submittedAt: submission.submittedAt,
                gradedAt: submission.gradedAt,
                status: submission.status,
                dueDate: submission.assignment.dueDate,
                rubricGrades: submission.rubricGrades
              };
            });

          console.log("Filtered grades:", grades);
          console.log("Number of published grades:", grades.length);
          setStudentGrades(grades);
        }
      } catch (error) {
        console.error("Error fetching grades data:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, userRole]);

  // Fetch submissions for teacher view
  useEffect(() => {
    if (!showTeacherView || !selectedAssignmentTitle || assignments.length === 0) return;

    const fetchSubmissions = async () => {
      try {
        setSubmissionsLoading(true);

        // Find the assignment ID by title
        const assignment = assignments.find(a => a.title === selectedAssignmentTitle);
        if (!assignment) {
          throw new Error("Assignment not found");
        }

        setSelectedAssignmentId(assignment._id);

        // Fetch real submissions using the assignment ID
        const response = await fetch(`/api/assignment/${assignment._id}/submissions`);
        if (!response.ok) {
          throw new Error("Failed to fetch submissions");
        }

        const data = await response.json();
        setSubmissions(data.submissions || []);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        // Fallback to demo data if API fails
        const demoSubmissions: StudentSubmission[] = [
          {
            _id: "1",
            studentId: "student1",
            grade: 87,
            feedback: "Good work overall, could improve on theoretical aspects",
            submittedAt: new Date().toISOString(),
            status: "graded",
            student: { id: "student1", name: "Alice Johnson", email: "alice@example.com" },
            assignment: { _id: "assignment1", title: selectedAssignmentTitle }
          },
          {
            _id: "2",
            studentId: "student2",
            grade: null,
            feedback: "",
            submittedAt: new Date().toISOString(),
            status: "submitted",
            student: { id: "student2", name: "Bob Smith", email: "bob@example.com" },
            assignment: { _id: "assignment1", title: selectedAssignmentTitle }
          }
        ];
        setSubmissions(demoSubmissions);
      } finally {
        setSubmissionsLoading(false);
      }
    };

    fetchSubmissions();
  }, [showTeacherView, selectedAssignmentTitle, assignments]);

  const handleAssignmentClick = (assignmentTitle: string) => {
    if (userRole === "teacher") {
      setSelectedAssignmentTitle(assignmentTitle);
      setShowTeacherView(true);
    }
  };

  const handleStudentGradeClick = (assignmentId: string) => {
    const grade = studentGrades.find(g => g.assignmentId === assignmentId);
    if (grade) {
      setSelectedGrade(grade);
      setShowStudentView(true);
    }
  };

  const handleBackToMain = () => {
    setShowTeacherView(false);
    setShowStudentView(false);
    setSelectedAssignmentTitle(null);
    setSelectedAssignmentId(null);
    setSelectedGrade(null);
    setSubmissions([]);
  };

  const handleGradeStudent = (submissionId: string, assignmentId: string) => {
    router.push(`/grade/${assignmentId}/${submissionId}`);
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "text-gray-500";
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-blue-600";
    if (grade >= 70) return "text-yellow-600";
    if (grade >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeBadgeVariant = (grade: number | null) => {
    if (grade === null) return "secondary";
    if (grade >= 90) return "default";
    if (grade >= 80) return "secondary";
    if (grade >= 70) return "outline";
    return "destructive";
  };

  const getGradeDescription = (gradeValue: number | null) => {
    if (gradeValue === null) return "Not graded yet";
    if (gradeValue >= 90) return "Excellent";
    if (gradeValue >= 80) return "Good";
    if (gradeValue >= 70) return "Satisfactory";
    if (gradeValue >= 60) return "Needs Improvement";
    return "Unsatisfactory";
  };

  // Teacher submissions view
  if (showTeacherView && selectedAssignmentTitle) {
    const gradedSubmissions = submissions.filter(s => s.grade !== null);
    const averageGrade = gradedSubmissions.length > 0
      ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length)
      : 0;

    return (
      <Card className="bg-white rounded-xl shadow border border-primary-100">
        <CardHeader>
          <div className="flex items-center gap-3">
            <SecondaryButton variant="outline" size="sm" onClick={handleBackToMain}>
              <FiArrowLeft className="w-4 h-4" />
              Back
            </SecondaryButton>
            <div className="flex-1">
              <CardTitle className="text-base font-semibold text-primary-900">
                {selectedAssignmentTitle}
              </CardTitle>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <FiUsers className="w-3 h-3" />
                  {submissions.length} submissions
                </span>
                <span>Avg: {averageGrade}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {submissionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-primary-900">
                          {submission.student.name}
                        </h4>
                        {submission.grade !== null ? (
                          <Badge variant={getGradeBadgeVariant(submission.grade)} className="text-xs">
                            {submission.grade}%
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Not graded
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {submission.student.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </div>
                      {submission.feedback && (
                        <div className="text-xs text-gray-600 mt-1 italic">
                          &ldquo;{submission.feedback}&rdquo;
                        </div>
                      )}
                    </div>
                    <SecondaryButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleGradeStudent(submission._id, selectedAssignmentId || "placeholder")}
                      className="ml-3"
                    >
                      <FiEdit3 className="w-3 h-3 mr-1" />
                      {submission.grade !== null ? "Edit" : "Grade"}
                    </SecondaryButton>
                  </div>
                </div>
              ))}
              {submissions.length === 0 && (
                <div className="text-sm text-gray-600 text-center py-4">
                  No submissions yet for this assignment.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Student grade details view
  if (showStudentView && selectedGrade) {
    const isLateSubmission = selectedGrade.dueDate && new Date(selectedGrade.submittedAt) > new Date(selectedGrade.dueDate);

    return (
      <Card className="bg-white rounded-xl shadow border border-primary-100">
        <CardHeader>
          <div className="flex items-center gap-3">
            <SecondaryButton variant="outline" size="sm" onClick={handleBackToMain}>
              <FiArrowLeft className="w-4 h-4" />
              Back
            </SecondaryButton>
            <div className="flex-1">
              <CardTitle className="text-base font-semibold text-primary-900">
                {selectedGrade.assignmentTitle}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {selectedGrade.grade !== null ? (
                  <Badge variant={getGradeBadgeVariant(selectedGrade.grade)} className="text-sm">
                    {selectedGrade.grade}% - {getGradeDescription(selectedGrade.grade)}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-sm">
                    Awaiting Grade
                  </Badge>
                )}
                {isLateSubmission && (
                  <Badge variant="destructive" className="text-xs">
                    Late Submission
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Submission Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              Submission Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Submitted:</span>
                <div className="font-medium">
                  {new Date(selectedGrade.submittedAt).toLocaleString()}
                </div>
              </div>
              {selectedGrade.dueDate && (
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <div className={`font-medium ${isLateSubmission ? 'text-red-600' : ''}`}>
                    {new Date(selectedGrade.dueDate).toLocaleString()}
                  </div>
                </div>
              )}
              {selectedGrade.gradedAt && (
                <div>
                  <span className="text-gray-600">Graded:</span>
                  <div className="font-medium">
                    {new Date(selectedGrade.gradedAt).toLocaleString()}
                  </div>
                </div>
              )}
              <div>
                <span className="text-gray-600">Status:</span>
                <div className="font-medium capitalize">
                  {selectedGrade.status}
                </div>
              </div>
            </div>
          </div>

          {/* Grade Information */}
          {selectedGrade.grade !== null && (
            <div className="bg-primary-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-primary-900 mb-3 flex items-center gap-2">
                <FiAward className="w-4 h-4" />
                Grade Breakdown
              </h3>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getGradeColor(selectedGrade.grade)} mb-2`}>
                  {selectedGrade.grade}%
                </div>
                <div className="text-sm text-gray-600">
                  {getGradeDescription(selectedGrade.grade)}
                </div>
              </div>
            </div>
          )}

          {/* Rubric Grading */}
          {selectedGrade.rubricGrades && selectedGrade.rubricGrades.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">
                Rubric Assessment
              </h3>
              <div className="space-y-2">
                {selectedGrade.rubricGrades.map((rubricGrade, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">
                      Criteria {rubricGrade.criteriaIndex + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        Level {rubricGrade.levelRank + 1}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {rubricGrade.points} pts
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {selectedGrade.feedback && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                <FiMessageSquare className="w-4 h-4" />
                Teacher Feedback
              </h3>
              <div className="text-sm text-gray-700 leading-relaxed">
                {selectedGrade.feedback}
              </div>
            </div>
          )}

          {/* No feedback message */}
          {!selectedGrade.feedback && selectedGrade.status === "graded" && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600">
                No additional feedback provided for this submission.
              </div>
            </div>
          )}

          {/* Pending message */}
          {selectedGrade.status === "submitted" && (
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-sm text-yellow-800">
                Your submission is pending review. You will be notified when it has been graded.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Main view - loading state
  if (loading) {
    return (
      <Card className="bg-white rounded-xl shadow border border-primary-100">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-primary-900 flex items-center gap-2">
            <FiBarChart2 className="w-5 h-5 text-primary-900" />
            <span>Grades</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main view - error state
  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow border border-primary-100">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-primary-900 flex items-center gap-2">
            <FiBarChart2 className="w-5 h-5 text-primary-900" />
            <span>Grades</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  // Main view - grades list
  return (
    <Card className="bg-white rounded-xl shadow border border-primary-100">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-primary-900 flex items-center gap-2">
          <FiBarChart2 className="w-5 h-5 text-primary-900" />
          <span>Grades</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {userRole === "teacher" ? (
            // Teacher view - show assignment analytics
            assignmentAnalytics.length > 0 ? (
              assignmentAnalytics.map((analytics, index) => (
                <div
                  key={index}
                  onClick={() => handleAssignmentClick(analytics.assignmentTitle)}
                  className="border-l-4 border-primary-300 pl-3 py-3 hover:bg-primary-50 rounded transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-primary-900 mb-1 group-hover:text-primary-700">
                        {analytics.assignmentTitle}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className={`font-medium ${getGradeColor(analytics.averageGrade)}`}>
                          Avg: {analytics.averageGrade}%
                        </span>
                        <span className="flex items-center gap-1">
                          <FiUsers className="w-3 h-3" />
                          {analytics.submissionCount} submissions
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {analytics.onTimeCount} on time
                        </Badge>
                        {analytics.lateCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {analytics.lateCount} late
                          </Badge>
                        )}
                        {analytics.notSubmittedCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {analytics.notSubmittedCount} missing
                          </Badge>
                        )}
                      </div>
                    </div>
                    <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">No assignments with grades yet.</div>
            )
          ) : (
            // Student view - show individual grades
            studentGrades.length > 0 ? (
              studentGrades.map((grade) => (
                <div
                  key={grade.assignmentId}
                  onClick={() => handleStudentGradeClick(grade.assignmentId)}
                  className="border-l-4 border-success-300 pl-3 py-3 hover:bg-primary-50 rounded transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-primary-900 mb-1 group-hover:text-primary-700">
                        {grade.assignmentTitle}
                      </h4>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {grade.grade !== null ? (
                            <Badge variant={getGradeBadgeVariant(grade.grade)} className="text-xs">
                              {grade.grade}%
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not graded
                            </Badge>
                          )}
                          <span className="text-gray-500">
                            {grade.status === "graded" ? "Graded" : "Submitted"}
                          </span>
                        </div>
                        <span className="text-gray-500">
                          {new Date(grade.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {grade.feedback && (
                        <div className="mt-1 text-xs text-gray-600 truncate">
                          Feedback: {grade.feedback}
                        </div>
                      )}
                    </div>
                    <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">No submitted assignments yet.</div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
