import { Course } from "@/lib/schemas/database";
import { Layers3 } from "lucide-react";

interface CourseUnitsProps {
  course: Course;
}

export default function CourseUnits({ course }: CourseUnitsProps) {
  if (!course.units || course.units.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
      <h2 className="text-base font-semibold text-primary-900 mb-4 flex items-center gap-2">
        <Layers3 className="w-5 h-5 text-primary-900" />
        <span>Course Units</span>
      </h2>
      <div className="space-y-4">
        {course.units.map((unit, idx) => (
          <div key={idx} className="border-l-4 border-secondary-300 pl-4 py-2 hover:bg-primary-50 rounded transition-colors">
            <h3 className="text-base font-medium text-primary-900 mb-1">
              Unit {idx + 1}: {unit.name}
            </h3>
            {unit.description && (
              <p className="text-base text-primary-700 leading-relaxed">
                {unit.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
