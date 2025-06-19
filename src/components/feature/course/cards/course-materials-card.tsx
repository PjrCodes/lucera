import { FiFileText } from "react-icons/fi";

interface Material {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

export default function CourseMaterialsCard({ materials }: { materials: Material[] }) {
  return (
    <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-6">
      <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2"><FiFileText />Course Materials</h2>
      <div className="space-y-2">
        {materials.map((material) => (
          <div key={material.id} className="flex items-center gap-3 p-2 hover:bg-primary-100 rounded-lg transition-colors group">
            <FiFileText className="w-4 h-4 text-primary-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-900 truncate">{material.name}</p>
              <p className="text-xs text-primary-500">{material.size}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
