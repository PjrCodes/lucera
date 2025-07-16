"use client";

import { useState, useEffect } from "react";
import { FiArrowLeft, FiEdit3, FiUsers, FiClock } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { useRouter } from "next/navigation";

interface TeacherGradesViewProps {
  courseId: string;
  assignmentTitle: string;
  onBack: () => void;
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

export default function TeacherGradesView({ courseId, assignmentTitle, onBack }: TeacherGradesViewProps) {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, we need to get all assignments for this course to find the assignment ID
        // This is a workaround since we only have the title
        const assignmentsResponse = await fetch(`/api/analytics/assignments?courseId=${courseId}`);
        if (!assignmentsResponse.ok) {
          throw new Error("Failed to fetch assignments");
        }
        const assignmentsData = await assignmentsResponse.json();

        // Find the assignment ID by title (this is not ideal, but works for the demo)
        // In a real implementation, you'd pass the assignment ID directly
        const foundAssignment = assignmentsData.analytics.find((a: { assignmentTitle: string }) => a.assignmentTitle === assignmentTitle);
        if (!foundAssignment) {
          throw new Error("Assignment not found");
        }

        // For now, we'll need to make an API call to get assignment by title or implement a better solution
        // Let's simulate finding the assignment ID
        setAssignmentId("placeholder_id");

        // This would be the actual call once we have the assignment ID:
        // const submissionsResponse = await fetch(`/api/assignment/${assignmentId}/submissions`);

        // For demo purposes, let's use placeholder data
        const demoSubmissions: StudentSubmission[] = [
          {
            _id: "1",
            studentId: "student1",
            grade: 87,
            feedback: "Good work overall, could improve on theoretical aspects",
            submittedAt: new Date().toISOString(),
            status: "graded",
            student: { id: "student1", name: "Alice Johnson", email: "alice@example.com" },
            assignment: { _id: "assignment1", title: assignmentTitle }
          },
          {
            _id: "2",
            studentId: "student2",
            grade: null,
            feedback: "",
            submittedAt: new Date().toISOString(),
            status: "submitted",
            student: { id: "student2", name: "Bob Smith", email: "bob@example.com" },
            assignment: { _id: "assignment1", title: assignmentTitle }
          },
          {
            _id: "3",
            studentId: "student3",
            grade: 92,
            feedback: "Excellent work! Shows deep understanding of the concepts",
            submittedAt: new Date().toISOString(),
            status: "graded",
            student: { id: "student3", name: "Carol Davis", email: "carol@example.com" },
            assignment: { _id: "assignment1", title: assignmentTitle }
          }
        ];

        setSubmissions(demoSubmissions);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [courseId, assignmentTitle]);

  const handleGradeStudent = (submissionId: string, assignmentId: string) => {
    router.push(`/grade/${assignmentId}/${submissionId}`);
  };

  const getGradeBadgeVariant = (grade: number | null) => {
    if (grade === null) return "secondary";
    if (grade >= 90) return "default";
    if (grade >= 80) return "secondary";
    if (grade >= 70) return "outline";
    return "destructive";
  };

  if (loading) {
    return (
      <Card className="bg-white rounded-xl shadow border border-primary-100">
        <CardHeader>
          <div className="flex items-center gap-3">
            <SecondaryButton variant="outline" size="sm" onClick={onBack}>
              <FiArrowLeft className="w-4 h-4" />
              Back
            </SecondaryButton>
            <CardTitle className="text-base font-semibold text-primary-900">
              Loading submissions...
            </CardTitle>
          </div>
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

  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow border border-primary-100">
        <CardHeader>
          <div className="flex items-center gap-3">
            <SecondaryButton variant="outline" size="sm" onClick={onBack}>
              <FiArrowLeft className="w-4 h-4" />
              Back
            </SecondaryButton>
            <CardTitle className="text-base font-semibold text-primary-900">
              Error Loading Submissions
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const gradedSubmissions = submissions.filter(s => s.grade !== null);
  const averageGrade = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length)
    : 0;

  return (
    <Card className="bg-white rounded-xl shadow border border-primary-100">
      <CardHeader>
        <div className="flex items-center gap-3">
          <SecondaryButton variant="outline" size="sm" onClick={onBack}>
            <FiArrowLeft className="w-4 h-4" />
            Back
          </SecondaryButton>
          <div className="flex-1">
            <CardTitle className="text-base font-semibold text-primary-900">
              {assignmentTitle}
            </CardTitle>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <FiUsers className="w-3 h-3" />
                {submissions.length} submissions
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                Avg: {averageGrade}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                  onClick={() => handleGradeStudent(submission._id, assignmentId || "placeholder")}
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
      </CardContent>
    </Card>
  );
}
