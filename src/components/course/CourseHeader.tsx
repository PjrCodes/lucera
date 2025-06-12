import { Course } from "@/app/courses/view/[course_id]/page";

interface CourseHeaderProps {
  course: Course;
}

export default function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-lucerablue-4 to-lucerablue-5 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          {course.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.name}</h1>
          {course.short_description && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {course.short_description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
