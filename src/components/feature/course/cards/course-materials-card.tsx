import { FileText, Download, Pencil } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import { ContentWithEmbeddedFile } from "@/lib/schemas/database";

export default function CourseMaterialsCard({
  courseMaterialsData,
  isTeacher,
}: {
  courseMaterialsData: ContentWithEmbeddedFile[];
  isTeacher: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
      <h2 className="text-base font-semibold text-primary-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary-900" />
        <span>Course Materials ({courseMaterialsData.length})</span>
      </h2>
      {courseMaterialsData.length > 0 ? (
        <div className="space-y-2">
          {courseMaterialsData.map((content) => (
            <div
              key={content._id.toString()}
              className="flex items-center gap-3 p-2 hover:bg-primary-50 rounded-lg transition-colors group"
            >
              <FileText className="w-4 h-4 text-primary-400" />
              <div className="flex-1 min-w-0">
                <p
                  className="text-base font-medium text-primary-900 truncate max-w-[10rem] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg"
                  title={content.title}
                >
                  {content.title}
                </p>
                {content.description && (
                  <p className="text-base text-primary-600 mt-1 wrap-balance">
                    {content.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-base text-primary-600">
                    Added: {formatDate(content.createdAt)}
                  </p>
                  <span className="text-base text-primary-400">
                    • {formatFileSize(content.file.size)}
                  </span>
                </div>
              </div>
              <a
                href={`/api/files/download/${content.fileId}`}
                download={content.file.name}
                className="ml-2 p-2 rounded hover:bg-primary-50 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4 text-primary-600" />
              </a>
              {isTeacher && content.type !== "syllabus" && (
                <a
                  href={`/edit/content/${content._id}`}
                  className="ml-1 p-2 rounded hover:bg-primary-50 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4 text-primary-600" />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-primary-300 mx-auto mb-3" />
          <p className="text-base text-primary-600">
            No course materials uploaded yet
          </p>
        </div>
      )}
    </div>
  );
}
