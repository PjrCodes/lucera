import { FileText, Download, Pencil, Ban, MessageSquareOff, Plus } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import { ContentWithEmbeddedFile } from "@/lib/schemas/database";
import ContentBookmarkButton from "@/components/feature/content/content-bookmark-button";
import Link from "next/link";

export default function CourseMaterialsCard({
  courseMaterialsData,
  isTeacher,
  courseId,
}: {
  courseMaterialsData: ContentWithEmbeddedFile[];
  isTeacher: boolean;
  courseId: string;
}) {
  return (
    <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          </div>
          <div className="flex flex-col text-sm sm:text-base text-primary-700">
            <h2 className="font-bold text-primary-700 gap-2 text-lg">
              Course Materials ({courseMaterialsData.length})
            </h2>
            <p className="text-primary-500">
              Resources and documents for this course.
            </p>
          </div>
        </div>
        {isTeacher && (
          <Link
            href={`/create/content?courseId=${courseId}`}
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Material
          </Link>
        )}
      </div>
      {courseMaterialsData.length > 0 ? (
        <div className="space-y-2">
          {courseMaterialsData.map((content) => (
            <div
              key={content._id.toString()}
              className="bg-primary-100/40 rounded-lg shadow-sm hover:shadow-md transition-shadow py-3 px-4 group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-primary-600" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-base font-medium text-primary-900 truncate max-w-[10rem] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg"
                    title={content.title}
                  >
                    {content.title}
                  </p>
                  {content.description && (
                    <p className="text-sm text-primary-600 mt-1 wrap-balance">
                      {content.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-primary-600">
                      Added: {formatDate(content.createdAt)}
                    </p>
                    <span className="text-sm text-primary-400">
                      • {formatFileSize(content.file.size)}
                    </span>
                    {/* Security indicators */}
                    {content.blockDownload && (
                      <div className="flex items-center gap-1" title="Download blocked by instructor">
                        <Ban className="w-3 h-3 text-danger-500" />
                        <span className="text-xs text-danger-600">No Download</span>
                      </div>
                    )}
                    {content.blockChatbot && (
                      <div className="flex items-center gap-1" title="LISA chatbot blocked for this document">
                        <MessageSquareOff className="w-3 h-3 text-warning-500" />
                        <span className="text-xs text-warning-600">No Chat</span>
                      </div>
                    )}
                  </div>
                </div>
                <ContentBookmarkButton
                  contentId={content._id.toString()}
                />
                {content.blockDownload && !isTeacher ? (
                  // Use secure PDF viewer for blocked downloads (students only)
                  <Link
                    href={`/view/document/${content.fileId}`}
                    className="ml-2 p-2 rounded hover:bg-primary-50 transition-colors"
                    title="View (Download blocked)"
                  >
                    <FileText className="w-4 h-4 text-warning-600" />
                  </Link>
                ) : (
                  // Normal download for teachers or non-blocked content
                  <a
                    href={`/api/files/download/${content.fileId}`}
                    download={content.file.name}
                    className="ml-2 p-2 rounded hover:bg-primary-50 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-primary-600" />
                  </a>
                )}
                {isTeacher && (
                  <a
                    href={`/edit/content/${content._id}`}
                    className="ml-2 p-2 rounded hover:bg-primary-50 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-primary-600" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-primary-300 mx-auto mb-3" />
          <p className="text-lg text-primary-600 mb-4">
            No course materials available yet.
          </p>
          {isTeacher && (
            <Link
              href={`/create/content?courseId=${courseId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Material
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
