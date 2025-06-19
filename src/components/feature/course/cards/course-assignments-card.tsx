import { FiClipboard } from "react-icons/fi";

interface Assignment {
  id: number;
  name: string;
  due: string;
  status: string;
  grade: string | null;
}

export default function CourseAssignmentsCard({ assignments }: { assignments: Assignment[] }) {
  return (
    <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-6">
      <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2"><FiClipboard />Assignments</h2>
      <div className="space-y-3">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="border-l-4 border-secondary-300 pl-3 py-2">
            <h4 className="text-sm font-medium text-primary-900 mb-1">{assignment.name}</h4>
            <div className="flex items-center justify-between text-xs">
              <span className="text-primary-500">Due: {assignment.due}</span>
              <span className="text-primary-700">{assignment.grade ? `Grade: ${assignment.grade}` : assignment.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
