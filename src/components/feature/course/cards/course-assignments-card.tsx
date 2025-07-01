"use client";
import { AssignmentWithEmbeddedFile } from "@/lib/schemas/database";
import { FiClipboard, FiChevronRight } from "react-icons/fi";
import Link from "next/link";

interface CourseAssignmentsCardProps {
  assignments: AssignmentWithEmbeddedFile[];
  courseId: string;
  onAssignmentSelect?: (assignment: AssignmentWithEmbeddedFile) => void;
  selectedAssignmentId?: string | null;
}

export default function CourseAssignmentsCard({
  assignments,
  onAssignmentSelect,
  selectedAssignmentId,
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

  const handleAssignmentClick = (
    assignment: AssignmentWithEmbeddedFile,
    e: React.MouseEvent
  ) => {
    // If we have an onAssignmentSelect handler, prevent navigation and show in-place
    if (onAssignmentSelect) {
      e.preventDefault();
      onAssignmentSelect(assignment);
    }
    // Otherwise, let the Link handle navigation normally
  };

  if (assignments.length === 0) {
    return (
      <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-6">
        <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
          <FiClipboard />
          Assignments
        </h2>
        <p className="text-primary-600 text-sm">
          No assignments available for this course.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-6">
      <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
        <FiClipboard />
        Assignments
      </h2>
      <div className="space-y-3">
        {assignments.map((assignment) => {
          const overdue = isOverdue(assignment.dueDate);
          const upcoming = isUpcoming(assignment.startDate);
          const isSelected = selectedAssignmentId === assignment._id.toString();

          return (
            <Link
              key={assignment._id.toString()}
              href={`/view/assignment/${assignment._id.toString()}`}
              onClick={(e) => handleAssignmentClick(assignment, e)}
              className={`block w-full text-left border-l-4 ${
                isSelected
                  ? "border-primary-500 bg-white"
                  : "border-secondary-300"
              } pl-4 py-3 hover:bg-white hover:shadow-sm transition-all duration-200 rounded-r-lg group`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`text-sm font-medium ${
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
                  <div className="flex items-center gap-4 text-xs text-primary-600">
                    {assignment.dueDate ? (
                      <span
                        className={overdue ? "text-red-600 font-medium" : ""}
                      >
                        Due: {formatDate(assignment.dueDate)}
                      </span>
                    ) : (
                      <span className="text-gray-500">No due date set</span>
                    )}
                    <span>{assignment.grading?.total_points || 0} points</span>
                  </div>
                </div>
                <FiChevronRight
                  className={`w-4 h-4 ${
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
