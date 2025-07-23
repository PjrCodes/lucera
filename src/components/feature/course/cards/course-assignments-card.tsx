"use client";
import { AssignmentWithEmbeddedFile } from "@/lib/schemas/database";
import { ClipboardList, ChevronRight, Plus } from "lucide-react";
import { Ban, MessageSquareOff } from "lucide-react";
import Link from "next/link";

interface CourseAssignmentsCardProps {
  assignments: AssignmentWithEmbeddedFile[];
  courseId: string;
  isTeacher?: boolean;
}

export default function CourseAssignmentsCard({
  assignments,
  courseId,
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
      <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <div className="flex flex-col text-sm sm:text-base text-primary-700">
              <h2 className="font-bold text-primary-700 gap-2 text-lg">
                Assignments
              </h2>
              <p className="text-primary-500">
                Course assignments and tasks.
              </p>
            </div>
          </div>
          {isTeacher && (
            <Link
              href={`/create/assignment?courseId=${courseId}`}
              className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Assignment
            </Link>
          )}
        </div>
        <div className="text-center py-8">
          <ClipboardList className="w-12 h-12 text-primary-300 mx-auto mb-3" />
          <p className="text-lg text-primary-600 mb-4">
            No assignments available for this course.
          </p>
          {isTeacher && (
            <Link
              href={`/create/assignment?courseId=${courseId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Assignment
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          </div>
          <div className="flex flex-col text-sm sm:text-base text-primary-700">
            <h2 className="font-bold text-primary-700 gap-2 text-lg">
              Assignments
            </h2>
            <p className="text-primary-500">
              Course assignments and tasks.
            </p>
          </div>
        </div>
        {isTeacher && (
          <Link
            href={`/create/assignment?courseId=${courseId}`}
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Assignment
          </Link>
        )}
      </div>
      <div className="space-y-2">
        {assignments.map((assignment) => {
          const overdue = isOverdue(assignment.dueDate);
          const upcoming = isUpcoming(assignment.startDate);

          return (
            <Link
              key={assignment._id.toString()}
              href={`/view/assignment/${assignment._id.toString()}`}
              className={`block w-full text-left bg-primary-100/40 rounded-lg shadow-sm hover:shadow-md transition-shadow hover:cursor-pointer py-3 px-4 group`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-medium text-primary-900 group-hover:text-primary-700">
                      {assignment.title}
                    </h4>
                    {overdue && (
                      <span className="px-2 py-1 bg-danger-100 text-danger-800 text-xs font-medium rounded-full">
                        Overdue
                      </span>
                    )}
                    {upcoming && (
                      <span className="px-2 py-1 bg-info-100 text-info-800 text-xs font-medium rounded-full">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-primary-600">
                    {assignment.dueDate ? (
                      <span
                        className={overdue ? "text-danger-600 font-medium" : ""}
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
                        <Ban className="w-3 h-3 text-danger-500" />
                        <span className="text-xs text-danger-600">No Download</span>
                      </div>
                    )}
                    {assignment.blockChatbot && (
                      <div className="flex items-center gap-1" title="LISA chatbot blocked for this document">
                        <MessageSquareOff className="w-3 h-3 text-warning-500" />
                        <span className="text-xs text-warning-600">No Chat</span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-primary-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
