import { notFound } from "next/navigation";
import { getFileRecord } from "@/lib/database-service/files";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PDFViewer from "@/components/core/pdf-viewer";

interface ViewDocumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewDocumentPage({ params }: ViewDocumentPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  try {
    const file = await getFileRecord(id);

    if (!file) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Document Viewer
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>📄 {file.name}</span>
                <span>🚫 Download blocked by instructor</span>
                <span>🔒 Secure viewing mode</span>
              </div>
            </div>

            <PDFViewer
              fileUrl={`/api/files/view/${file._id}`}
              preventCopy={true}
              downloadDisabled={true}
              readOnly={true}
              height="70vh"
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading document:", error);
    notFound();
  }
}
