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
      <h2 className="text-base font-semibold text-primary-900 mb-4 flex items-center gap-2">
        <FiBarChart2 className="w-5 h-5 text-primary-900" />
        <span>Grades</span>
      </h2>
      <div className="space-y-3">
        {grades && grades.length > 0 ? (
          grades.map((grade) => (
            <div
              key={grade.id}
              className="border-l-4 border-success-300 pl-3 py-2 hover:bg-primary-50 rounded transition-colors"
            >
              <h4 className="text-base font-medium text-primary-900 mb-1">
                {grade.title}
              </h4>
              <div className="flex items-center justify-between text-base">
                <span className="text-success-700">Score: {grade.score}</span>
                <span className="text-primary-600">{grade.date}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-base text-primary-600">No grades available.</div>
        )}
      </div>
    </div>
  );
}
