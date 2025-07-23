"use client";

import React, { useState } from "react";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { UserWithData } from "@/lib/schemas/database";
import { Users } from "lucide-react";
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
      <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <div className="flex flex-col text-sm sm:text-base text-primary-700">
              <h2 className="font-bold text-primary-700 gap-2 text-lg">
                Students ({students.length})
              </h2>
              <p className="text-primary-500">
                Enrolled students in this course.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {students.length > 0 ? (
            students.map((student) => (
              <div
                key={student.id}
                className="bg-primary-100/40 rounded-lg shadow-sm hover:shadow-md transition-shadow py-3 px-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-900 font-bold">
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
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-primary-300 mx-auto mb-3" />
              <p className="text-lg text-primary-600">No students enrolled.</p>
            </div>
          )}

          {isTeacher && (
            <div className="pt-4">
              <SecondaryButton
                variant="outline"
                onClick={() => setIsInviteModalOpen(true)}
                // className="hover:bg-primary-50"
              >
                <Users className="w-4 h-4 mr-2 text-primary-900" />
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
