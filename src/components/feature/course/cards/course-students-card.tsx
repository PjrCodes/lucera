import { UserWithData } from "@/lib/schemas/database";
import { FiUsers } from "react-icons/fi";


export default function CourseStudentsCard({ students }: { students: UserWithData[] }) {
  return (
    <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-6">
      <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2"><FiUsers />Students</h2>
      <div className="space-y-2">
        {students.length > 0 ? students.map((student) => (
          <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-secondary-200 flex items-center justify-center text-secondary-900 font-bold">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-900 truncate">{student.name}</p>
              {student.email && <p className="text-xs text-primary-500">{student.email}</p>}
            </div>
          </div>
        )) : <div className="text-primary-500">No students enrolled.</div>}
      </div>
    </div>
  );
}
