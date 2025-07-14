"use client";

import { useState, useEffect } from "react";
import { SubmittedAssignmentWithEmbeddedData } from "@/lib/schemas/database";
import { FiCalendar, FiFileText, FiCheck, FiClock, FiX } from "react-icons/fi";

interface StudentGradesViewProps {
  studentId: string;
  courseId?: string;
}

export default function StudentGradesView({ studentId, courseId }: StudentGradesViewProps) {
  const [submissions, setSubmissions] = useState<SubmittedAssignmentWithEmbeddedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const url = courseId
          ? `/api/student/grades?courseId=${courseId}`
          : `/api/student/grades`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch grades");
        }

        const data = await response.json();
        setSubmissions(data.submissions || []);
      } catch (error) {
        console.error("Error fetching grades:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch grades");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [studentId, courseId]);

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-blue-600";
    if (grade >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "graded":
        return <FiCheck className="w-4 h-4 text-green-600" />;
      case "submitted":
        return <FiClock className="w-4 h-4 text-yellow-600" />;
      default:
        return <FiX className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Filter only assignments where grades are published
  const publishedGrades = submissions.filter(
    submission => submission.assignment.gradesPublished && submission.grade !== undefined
  );

  return (
    <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
      <h2 className="text-xl font-semibold text-primary-900 mb-6">My Grades</h2>

      {publishedGrades.length === 0 ? (
        <div className="text-center py-12">
          <FiFileText className="mx-auto w-12 h-12 text-primary-300 mb-4" />
          <h3 className="text-lg font-medium text-primary-600 mb-2">
            No Grades Available
          </h3>
          <p className="text-primary-500">
            No grades have been published yet for your submissions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {publishedGrades.map((submission) => (
            <div
              key={submission._id.toString()}
              className="border border-primary-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(submission.status)}
                    <h3 className="font-medium text-primary-900">
                      {submission.assignment.title}
                    </h3>
                  </div>

                  <p className="text-sm text-primary-600 mb-2">
                    {submission.course?.name || 'Course not found'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-primary-600 mb-3">
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      Submitted: {formatDate(submission.submittedAt)}
                    </div>
                    {submission.gradedAt && (
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        Graded: {formatDate(submission.gradedAt)}
                      </div>
                    )}
                  </div>

                  {/* Rubric Breakdown */}
                  {submission.rubricGrades && submission.rubricGrades.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Grading Breakdown</h4>
                      <div className="space-y-1">
                        {submission.rubricGrades.map((rg, index) => {
                          const criteria = submission.assignment.grading.rubric.criteria[rg.criteriaIndex];
                          return (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">{criteria?.description || `Criteria ${rg.criteriaIndex + 1}`}</span>
                              <span className="font-medium">{rg.points} / {criteria?.points || 0} pts</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {submission.feedback && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Instructor Feedback</h4>
                      <p className="text-sm text-blue-800">{submission.feedback}</p>
                    </div>
                  )}
                </div>

                {/* Grade Display */}
                <div className="ml-4 text-right">
                  <div className={`text-2xl font-bold ${getGradeColor(submission.grade!)}`}>
                    {submission.grade}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {submission.assignment.grading.type === "percentage" ? "Grade" : "Score"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
