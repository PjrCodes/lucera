"use client";
import { AssignmentWithEmbeddedFile } from "@/lib/schemas/database";
import { FiClipboard, FiChevronRight, FiPlus } from "react-icons/fi";
import { Ban, MessageSquareOff } from "lucide-react";
import Link from "next/link";

interface CourseAssignmentsCardProps {
  assignments: AssignmentWithEmbeddedFile[];
  courseId: string;
  selectedAssignmentId?: string | null;
  isTeacher?: boolean;
}

export default function CourseAssignmentsCard({
  assignments,
  courseId,
  selectedAssignmentId,
  isTeacher,
}: CourseAssignmentsCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string | null) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  const isUpcoming = (startDate: string | null) => {
    return startDate && new Date(startDate) > new Date();
  };

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-primary-900 flex items-center gap-2">
            <FiClipboard className="w-5 h-5 text-primary-900" />
            <span>Assignments</span>
          </h2>
          {isTeacher && (
            <Link 
              href={`/create/assignment?courseId=${courseId}`}
              className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add Assignment
            </Link>
          )}
        </div>
        <div className="text-center py-8">
          <FiClipboard className="w-12 h-12 text-primary-300 mx-auto mb-3" />
          <p className="text-base text-primary-600 mb-4">
            No assignments available for this course.
          </p>
          {isTeacher && (
            <Link 
              href={`/create/assignment?courseId=${courseId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Create First Assignment
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-primary-900 flex items-center gap-2">
          <FiClipboard className="w-5 h-5 text-primary-900" />
          <span>Assignments</span>
        </h2>
        {isTeacher && (
          <Link 
            href={`/create/assignment?courseId=${courseId}`}
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Assignment
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {assignments.map((assignment) => {
          const overdue = isOverdue(assignment.dueDate);
          const upcoming = isUpcoming(assignment.startDate);
          const isSelected = selectedAssignmentId === assignment._id.toString();

          return (
            <Link
              key={assignment._id.toString()}
              href={`/view/assignment/${assignment._id.toString()}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full text-left border-l-4 ${
                isSelected
                  ? "border-primary-500 bg-primary-50"
                  : "border-secondary-300"
              } pl-4 py-3 hover:bg-primary-50 transition-all duration-200 rounded-r-lg group`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`text-base font-medium ${
                        isSelected
                          ? "text-primary-700"
                          : "text-primary-900 group-hover:text-primary-700"
                      }`}
                    >
                      {assignment.title}
                    </h4>
                    {overdue && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Overdue
                      </span>
                    )}
                    {upcoming && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-base text-primary-600">
                    {assignment.dueDate ? (
                      <span
                        className={overdue ? "text-red-600 font-medium" : ""}
                      >
                        Due: {formatDate(assignment.dueDate)}
                      </span>
                    ) : (
                      <span className="text-primary-500">No due date set</span>
                    )}
                    <span>{assignment.grading?.total_points || 0} points</span>
                    {/* Security indicators */}
                    {assignment.blockDownload && (
                      <div className="flex items-center gap-1" title="Download blocked by instructor">
                        <Ban className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600">No Download</span>
                      </div>
                    )}
                    {assignment.blockChatbot && (
                      <div className="flex items-center gap-1" title="LISA chatbot blocked for this document">
                        <MessageSquareOff className="w-3 h-3 text-orange-500" />
                        <span className="text-xs text-orange-600">No Chat</span>
                      </div>
                    )}
                  </div>
                </div>
                <FiChevronRight
                  className={`w-5 h-5 ${
                    isSelected
                      ? "text-primary-600"
                      : "text-primary-400 group-hover:text-primary-600"
                  } transition-colors flex-shrink-0`}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
