import { FileText, BookOpen, Download, Eye } from "lucide-react";
import { CourseContentData } from "@/lib/schemas";
import { formatDate, formatFileSize } from "@/lib/utils";

function isViewableFile(fileType: string): boolean {
  const viewableTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "text/plain",
    "text/html"
  ];
  return viewableTypes.includes(fileType);
}

function handleFileClick(viewUrl: string, downloadUrl: string, fileName: string, fileType: string) {
  if (isViewableFile(fileType)) {
    // Open in new tab for viewing
    window.open(viewUrl, '_blank');
  } else {
    // Download the file
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default function CourseMaterialsCard({ courseMaterialsData }: { courseMaterialsData: CourseContentData }) {
  const { syllabus, contents } = courseMaterialsData;

  return (
    <div className="space-y-6">
      {/* Syllabus Section */}
      <div className="bg-accent-50 rounded-xl shadow border border-accent-100 p-6">
        <h2 className="text-lg font-semibold text-accent-900 mb-4 flex items-center gap-2">
          <BookOpen />
          Course Syllabus
        </h2>
        <div
          className="flex items-center gap-3 p-3 bg-accent-100 rounded-lg cursor-pointer hover:bg-accent-200 transition-colors group"
          onClick={() => handleFileClick(syllabus.viewUrl, syllabus.downloadUrl, syllabus.fileName, syllabus.fileType)}
        >
          <BookOpen className="w-5 h-5 text-accent-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-accent-900 truncate group-hover:text-accent-800 max-w-[10rem] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg" title={syllabus.fileName}>{syllabus.fileName}</p>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-xs text-accent-600">{formatFileSize(syllabus.size)}</p>
              <p className="text-xs text-accent-600">Uploaded: {formatDate(syllabus.uploadDate)}</p>
              <p className="text-xs text-accent-600 uppercase">{syllabus.fileType}</p>
            </div>
          </div>
          {isViewableFile(syllabus.fileType) ? (
            <Eye className="w-4 h-4 text-accent-500 group-hover:text-accent-700" />
          ) : (
            <Download className="w-4 h-4 text-accent-500 group-hover:text-accent-700" />
          )}
        </div>
      </div>

      {/* Course Materials Section */}
      <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-6">
        <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
          <FileText />
          Course Materials ({contents.length})
        </h2>
        {contents.length > 0 ? (
          <div className="space-y-2">
            {contents.map((content) => (
              <div key={content._id.toString()} className="flex items-center gap-3 p-2 hover:bg-primary-100 rounded-lg transition-colors group">
                <FileText className="w-4 h-4 text-primary-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-900 truncate max-w-[10rem] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg" title={content.file?.fileName || content.title}>{content.title}</p>
                  {content.description && (
                    <p className="text-xs text-primary-600 mt-1 wrap-balance">{content.description}</p>
                  )}
                  <p className="text-xs text-primary-500 mt-1">Added: {formatDate(content.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-primary-300 mx-auto mb-3" />
            <p className="text-primary-500 text-sm">No course materials uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
