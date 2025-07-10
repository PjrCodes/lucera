"use client";

import { Course } from "@/lib/schemas/database";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { Edit, Bookmark, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { TextBox } from "@/components/core/inputs/text-box";
import { redirect } from "next/navigation";

interface CourseHeaderProps {
  course: Course;
  isTeacher?: boolean;
  isBookmarked?: boolean;
}

export default function CourseHeader({
  course,
  isTeacher = false,
  isBookmarked = false,
}: CourseHeaderProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/delete/course", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course._id.toString() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete course");
        setDeleting(false);
        return;
      }
      setShowDeleteDialog(false);
      // Optionally: refresh page or redirect
      redirect("/");
    } catch (e) {
      if (!(e instanceof Error)) {
        setError("Unknown error while deleting course");
        setDeleting(false);
        return;
      }
      if (e.message.includes("NEXT_REDIRECT")) {
        throw e;
      }

      setError(e.message || "Unknown error");
      setDeleting(false);
    }
  }

  return (
    <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            {course.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary-900 mb-2">
              {course.name}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SecondaryButton variant="outline" size="sm">
            <Bookmark
              className={`h-4 w-4 ${
                isBookmarked ? "fill-secondary-700 text-secondary-700" : ""
              }`}
            />
          </SecondaryButton>
          {isTeacher && (
            <>
              <SecondaryButton variant="outline" size="sm">
                <Link href={`/edit/course/${course._id}`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </SecondaryButton>
              <SecondaryButton
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="h-4 w-4" />
              </SecondaryButton>
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Course</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this course? This action
                      cannot be undone.
                      <br />
                      Please type <b>DELETE</b> to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <TextBox
                    value={deleteInput}
                    onChange={setDeleteInput}
                    placeholder="Type DELETE to confirm"
                    className="mt-2"
                  />
                  {error && (
                    <div className="text-red-600 text-sm mt-2">{error}</div>
                  )}
                  <DialogFooter>
                    <DialogClose asChild>
                      <SecondaryButton variant="outline" disabled={deleting}>
                        Cancel
                      </SecondaryButton>
                    </DialogClose>
                    <SecondaryButton
                      variant="default"
                      onClick={handleDelete}
                      disabled={deleteInput !== "DELETE" || deleting}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </SecondaryButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          {/* ...existing code for !isTeacher... */}
        </div>
      </div>
    </div>
  );
}
