"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { MultiSelect, Option } from "@/components/core/multi-select";
import { Plus, Users } from "lucide-react";

interface InviteStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  availableStudents: { id: string; name: string; email: string }[];
}

export default function InviteStudentsModal({
  isOpen,
  onClose,
  courseId,
  availableStudents,
}: InviteStudentsModalProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentOptions: Option[] = availableStudents.map((student) => ({
    value: student.id,
    label: `${student.name} (${student.email})`,
  }));

  const handleInvite = async () => {
    if (selectedStudents.length === 0) return;

    setIsInviting(true);
    setError(null);
    // TODO: Replace with actual API call
    const response = await fetch("/api/courses/invite-students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseId: courseId,
        studentIds: selectedStudents,
      }),
    });
    if (!response.ok) {
      const body = await response.json();
      setError(body.message);
      setIsInviting(false);
      return;
    } // Close modal and reset state
    setSelectedStudents([]);
    onClose();
  };

  const handleClose = () => {
    if (!isInviting) {
      setSelectedStudents([]);
      onClose();
    }
  };

  const handleStudentSelectionChange = (newSelected: string[]) => {
    setSelectedStudents(newSelected);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-2 border-primary-400 bg-primary-100">
        <DialogHeader>
          <DialogTitle className="text-primary-700 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Invite Students
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-primary-800 mb-2">
              Select students to invite:
            </label>

            {/* Selected student pills */}
            {selectedStudents.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedStudents.map((studentId) => {
                  const student = availableStudents.find(
                    (s) => s.id === studentId
                  );
                  if (!student) return null;
                  return (
                    <span
                      key={studentId}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 border border-primary-300"
                    >
                      {student.name}
                    </span>
                  );
                })}
              </div>
            )}

            <MultiSelect
              options={studentOptions}
              selected={selectedStudents}
              onChange={handleStudentSelectionChange}
              placeholder="Choose students..."
              emptyText="No available students found"
              icon={<Plus className="w-4 h-4" />}
            />
          </div>

          {selectedStudents.length > 0 && (
            <div className="bg-primary-200 p-3 rounded-lg">
              <p className="text-sm text-primary-800">
                <strong>{selectedStudents.length}</strong> student
                {selectedStudents.length > 1 ? "s" : ""} selected
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <SecondaryButton
            variant="outline"
            onClick={handleClose}
            disabled={isInviting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            onClick={handleInvite}
            disabled={selectedStudents.length === 0 || isInviting}
          >
            {isInviting
              ? "Inviting..."
              : `Invite ${selectedStudents.length || ""} Student${
                  selectedStudents.length !== 1 ? "s" : ""
                }`}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
