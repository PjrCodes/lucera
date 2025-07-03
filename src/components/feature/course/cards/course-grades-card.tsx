import { FiBarChart2 } from "react-icons/fi";

interface Grade {
  id: number;
  title: string;
  score: string;
  date: string;
}

export default function CourseGradesCard({ grades }: { grades: Grade[] }) {
  return (
    <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
      <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
        <FiBarChart2 />
        Grades
      </h2>
      <div className="space-y-3">
        {grades && grades.length > 0 ? (
          grades.map((grade) => (
            <div
              key={grade.id}
              className="border-l-4 border-success-300 pl-3 py-2"
            >
              <h4 className="text-sm font-medium text-primary-900 mb-1">
                {grade.title}
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-success-700">Score: {grade.score}</span>
                <span className="text-primary-500">{grade.date}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-primary-500">No grades available.</div>
        )}
      </div>
    </div>
  );
}
