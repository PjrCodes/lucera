import { FileText, Download } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import { ContentWithEmbeddedFile } from "@/lib/schemas/database";

export default function CourseMaterialsCard({
  courseMaterialsData,
}: {
  courseMaterialsData: ContentWithEmbeddedFile[];
}) {
  return (
    <div className="space-y-6">
      {/* Course Materials Section */}
      <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-6">
        <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
          <FileText />
          Course Materials ({courseMaterialsData.length})
        </h2>
        {courseMaterialsData.length > 0 ? (
          <div className="space-y-2">
            {courseMaterialsData.map((content) => (
              <div
                key={content._id.toString()}
                className="flex items-center gap-3 p-2 hover:bg-primary-100 rounded-lg transition-colors group"
              >
                <FileText className="w-4 h-4 text-primary-400" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium text-primary-900 truncate max-w-[10rem] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg"
                    title={content.title}
                  >
                    {content.title}
                  </p>
                  {content.description && (
                    <p className="text-xs text-primary-600 mt-1 wrap-balance">
                      {content.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-primary-500">
                      Added: {formatDate(content.createdAt)}
                    </p>

                    <span className="text-xs text-primary-400">
                      • {formatFileSize(content.file.size)}
                    </span>
                  </div>
                </div>
                <a
                  href={`/api/files/download/${content.fileId}`}
                  download={content.file.name}
                  className="ml-2 p-2 rounded hover:bg-primary-200 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-primary-600" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-primary-300 mx-auto mb-3" />
            <p className="text-primary-500 text-sm">
              No course materials uploaded yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
