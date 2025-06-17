import { Course } from "@/app/courses/view/[course_id]/page";

interface CourseUnitsProps {
  course: Course;
}

export default function CourseUnits({ course }: CourseUnitsProps) {
  if (!course.units || course.units.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Units</h2>
      <div className="space-y-4">
        {course.units.map((unit, idx) => (
          <div key={idx} className="border-l-4 border-lucerablue-3 pl-4 py-2">
            <h3 className="font-medium text-gray-900 mb-1">
              Unit {idx + 1}: {unit.name}
            </h3>
            {unit.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {unit.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
