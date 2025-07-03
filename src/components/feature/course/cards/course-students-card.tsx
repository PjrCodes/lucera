"use client";

import React, { useState } from "react";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { UserWithData } from "@/lib/schemas/database";
import { FiUsers } from "react-icons/fi";
import InviteStudentsModal from "./invite-students-modal";

interface CourseStudentsCardProps {
  students: UserWithData[];
  courseId: string;
  isTeacher: boolean;
  availableStudents: { id: string; name: string; email: string }[];
}

export default function CourseStudentsCard({
  students,
  courseId,
  isTeacher,
  availableStudents,
}: CourseStudentsCardProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
        <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
          <FiUsers />
          Students
          <span className="text-sm font-normal text-primary-600">
            ({students.length})
          </span>
        </h2>
        <div className="space-y-2">
          {students.length > 0 ? (
            students.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-2 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-secondary-200 flex items-center justify-center text-secondary-900 font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-900 truncate">
                    {student.name}
                  </p>
                  {student.email && (
                    <p className="text-xs text-primary-600">{student.email}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-primary-600">No students enrolled.</div>
          )}

          {isTeacher && (
            <div className="pt-2">
              <SecondaryButton
                variant="outline"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <FiUsers className="w-4 h-4 mr-2" />
                <span className="text-sm">Add Students</span>
              </SecondaryButton>
            </div>
          )}
        </div>
      </div>

      {isTeacher && (
        <InviteStudentsModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          courseId={courseId}
          availableStudents={availableStudents}
        />
      )}
    </>
  );
}
