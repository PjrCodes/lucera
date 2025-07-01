import { Course } from "@/lib/schemas/database";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { Edit, Bookmark } from "lucide-react";
import Link from "next/link";

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
              className={`h-4 w-4 ${isBookmarked ? "fill-secondary-700 text-secondary-700" : ""}`}
            />
          </SecondaryButton>
          {isTeacher && (
            <SecondaryButton variant="outline" size="sm">
              <Link href={`/edit/course/${course._id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </SecondaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
