
import { Course } from "@/lib/schemas/database";
import { Layers3 } from "lucide-react";

interface CourseUnitsProps {
  course: Course;
}

export default function CourseUnits({ course }: CourseUnitsProps) {
  if (!course.units || course.units.length === 0) {
    return (
      <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
            <Layers3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          </div>
          <div className="flex flex-col text-sm sm:text-base text-primary-700">
            <h2 className="font-bold text-primary-700 gap-2 text-lg">
              Course Units
            </h2>
            <p className="text-primary-500">
              Course breakdown and structure.
            </p>
          </div>
        </div>
        <div className="text-center py-8 text-primary-600">
          <Layers3 className="w-12 h-12 text-primary-300 mx-auto mb-3" />
          <p className="text-lg">No course units defined</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
          <Layers3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
        </div>
        <div className="flex flex-col text-sm sm:text-base text-primary-700">
          <h2 className="font-bold text-primary-700 gap-2 text-lg">
            Course Units
          </h2>
          <p className="text-primary-500">
            Course breakdown and structure.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {course.units.map((unit, idx) => (
          <div
            key={idx}
            className="bg-primary-100/40 rounded-lg shadow-sm hover:shadow-md transition-shadow py-3 px-4"
          >
            <h3 className="text-base font-medium text-primary-900 mb-2">
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
