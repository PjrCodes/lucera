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
        <h2 className="text-base font-semibold text-primary-900 mb-4 flex items-center gap-2">
          <FiUsers className="w-5 h-5 text-primary-900" />
          <span>Students</span>
          <span className="text-base font-normal text-primary-600">
            ({students.length})
          </span>
        </h2>
        <div className="space-y-2">
          {students.length > 0 ? (
            students.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-secondary-200 flex items-center justify-center text-secondary-900 font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-primary-900 truncate">
                    {student.name}
                  </p>
                  {student.email && (
                    <p className="text-sm text-primary-600">{student.email}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-base text-primary-600">
              No students enrolled.
            </div>
          )}

          {isTeacher && (
            <div className="pt-2">
              <SecondaryButton
                variant="outline"
                onClick={() => setIsInviteModalOpen(true)}
                className="hover:bg-primary-50"
              >
                <FiUsers className="w-4 h-4 mr-2 text-primary-900" />
                <span className="text-base">Add Students</span>
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
