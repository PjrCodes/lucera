import { FiFileText, FiBookOpen, FiDownload, FiEye } from "react-icons/fi";
import { CourseContentData } from "@/lib/schemas";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

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
          <FiBookOpen />
          Course Syllabus
        </h2>
        <div 
          className="flex items-center gap-3 p-3 bg-accent-100 rounded-lg cursor-pointer hover:bg-accent-200 transition-colors group"
          onClick={() => handleFileClick(syllabus.viewUrl, syllabus.downloadUrl, syllabus.fileName, syllabus.fileType)}
        >
          <FiBookOpen className="w-5 h-5 text-accent-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-accent-900 truncate group-hover:text-accent-800">{syllabus.fileName}</p>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-xs text-accent-600">{formatFileSize(syllabus.size)}</p>
              <p className="text-xs text-accent-600">Uploaded: {formatDate(syllabus.uploadDate)}</p>
              <p className="text-xs text-accent-600 uppercase">{syllabus.fileType}</p>
            </div>
          </div>
          {isViewableFile(syllabus.fileType) ? (
            <FiEye className="w-4 h-4 text-accent-500 group-hover:text-accent-700" title="Click to view" />
          ) : (
            <FiDownload className="w-4 h-4 text-accent-500 group-hover:text-accent-700" title="Click to download" />
          )}
        </div>
      </div>

      {/* Course Materials Section */}
      <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-6">
        <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
          <FiFileText />
          Course Materials ({contents.length})
        </h2>
        {contents.length > 0 ? (
          <div className="space-y-2">
            {contents.map((content) => (
              <div 
                key={content._id.toString()} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors group ${
                  content.file 
                    ? 'hover:bg-primary-100 cursor-pointer' 
                    : 'bg-primary-25 opacity-75'
                }`}
                onClick={() => content.file && handleFileClick(content.file.viewUrl, content.file.downloadUrl, content.file.fileName, content.file.fileType)}
              >
                <FiFileText className={`w-4 h-4 ${content.file ? 'text-primary-400' : 'text-primary-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    content.file ? 'text-primary-900 group-hover:text-primary-800' : 'text-primary-600'
                  }`}>
                    {content.title}
                  </p>
                  {content.description && (
                    <p className="text-xs text-primary-600 mt-1 truncate">{content.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-xs text-primary-500">Added: {formatDate(content.createdAt)}</p>
                    {content.file && (
                      <>
                        <p className="text-xs text-primary-500">{formatFileSize(content.file.size)}</p>
                        <p className="text-xs text-primary-500 uppercase">{content.file.fileType}</p>
                      </>
                    )}
                  </div>
                </div>
                {content.file ? (
                  isViewableFile(content.file.fileType) ? (
                    <FiEye className="w-4 h-4 text-primary-500 group-hover:text-primary-700" title="Click to view" />
                  ) : (
                    <FiDownload className="w-4 h-4 text-primary-500 group-hover:text-primary-700" title="Click to download" />
                  )
                ) : (
                  <span className="text-xs text-primary-400 px-2 py-1 bg-primary-100 rounded">No file</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiFileText className="w-12 h-12 text-primary-300 mx-auto mb-3" />
            <p className="text-primary-500 text-sm">No course materials uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
