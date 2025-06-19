import { Course } from "@/app/courses/view/[course_id]/page";

interface CourseHeaderProps {
  course: Course;
}

export default function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-6">
      <div className="flex items-center justify-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          {course.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary-900 mb-2">{course.name}</h1>
        </div>
      </div>
    </div>
  );
}
