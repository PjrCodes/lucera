"use client";

import { FiArrowLeft, FiCalendar, FiMessageSquare, FiAward } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecondaryButton } from "@/components/core/buttons/secondary";

interface StudentGradesViewProps {
  grade: {
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
  } | undefined;
  onBack: () => void;
}

export default function StudentGradesView({ grade, onBack }: StudentGradesViewProps) {
  if (!grade) {
    return (
      <Card className="bg-white rounded-xl shadow border border-primary-100">
        <CardHeader>
          <div className="flex items-center gap-3">
            <SecondaryButton variant="outline" size="sm" onClick={onBack}>
              <FiArrowLeft className="w-4 h-4" />
              Back
            </SecondaryButton>
            <CardTitle className="text-base font-semibold text-primary-900">
              Grade Details
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-gray-600">Grade information not found.</div>
        </CardContent>
      </Card>
    );
  }

  const getGradeColor = (gradeValue: number | null) => {
    if (gradeValue === null) return "text-gray-500";
    if (gradeValue >= 90) return "text-green-600";
    if (gradeValue >= 80) return "text-blue-600";
    if (gradeValue >= 70) return "text-yellow-600";
    if (gradeValue >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeBadgeVariant = (gradeValue: number | null) => {
    if (gradeValue === null) return "secondary";
    if (gradeValue >= 90) return "default";
    if (gradeValue >= 80) return "secondary";
    if (gradeValue >= 70) return "outline";
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

  const isLateSubmission = grade.dueDate && new Date(grade.submittedAt) > new Date(grade.dueDate);

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
              {grade.assignmentTitle}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {grade.grade !== null ? (
                <Badge variant={getGradeBadgeVariant(grade.grade)} className="text-sm">
                  {grade.grade}% - {getGradeDescription(grade.grade)}
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
                {new Date(grade.submittedAt).toLocaleString()}
              </div>
            </div>
            {grade.dueDate && (
              <div>
                <span className="text-gray-600">Due Date:</span>
                <div className={`font-medium ${isLateSubmission ? 'text-red-600' : ''}`}>
                  {new Date(grade.dueDate).toLocaleString()}
                </div>
              </div>
            )}
            {grade.gradedAt && (
              <div>
                <span className="text-gray-600">Graded:</span>
                <div className="font-medium">
                  {new Date(grade.gradedAt).toLocaleString()}
                </div>
              </div>
            )}
            <div>
              <span className="text-gray-600">Status:</span>
              <div className="font-medium capitalize">
                {grade.status}
              </div>
            </div>
          </div>
        </div>

        {/* Grade Information */}
        {grade.grade !== null && (
          <div className="bg-primary-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-primary-900 mb-3 flex items-center gap-2">
              <FiAward className="w-4 h-4" />
              Grade Breakdown
            </h3>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getGradeColor(grade.grade)} mb-2`}>
                {grade.grade}%
              </div>
              <div className="text-sm text-gray-600">
                {getGradeDescription(grade.grade)}
              </div>
            </div>
          </div>
        )}

        {/* Rubric Grading */}
        {grade.rubricGrades && grade.rubricGrades.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              Rubric Assessment
            </h3>
            <div className="space-y-2">
              {grade.rubricGrades.map((rubricGrade, index) => (
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
        {grade.feedback && (
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
              <FiMessageSquare className="w-4 h-4" />
              Teacher Feedback
            </h3>
            <div className="text-sm text-gray-700 leading-relaxed">
              {grade.feedback}
            </div>
          </div>
        )}

        {/* No feedback message */}
        {!grade.feedback && grade.status === "graded" && (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600">
              No additional feedback provided for this submission.
            </div>
          </div>
        )}

        {/* Pending message */}
        {grade.status === "submitted" && (
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
