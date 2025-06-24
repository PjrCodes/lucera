import { Course } from "@/lib/schemas";

interface CourseUnitsProps {
  course: Course;
}

export default function CourseUnits({ course }: CourseUnitsProps) {
  if (!course.units || course.units.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-6">
      <h2 className="text-lg font-semibold text-primary-900 mb-4">Course Units</h2>
      <div className="space-y-4">
        {course.units.map((unit, idx) => (
          <div key={idx} className="border-l-4 border-secondary-300 pl-4 py-2">
            <h3 className="text-primary-900 font-medium mb-1">
              Unit {idx + 1}: {unit.name}
            </h3>
            {unit.description && (
              <p className="text-sm text-primary-700 leading-relaxed">
                {unit.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
