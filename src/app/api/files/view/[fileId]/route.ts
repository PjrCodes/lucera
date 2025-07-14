import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withAuthorisation } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { loadFileFromDiskById } from "@/lib/database-service/files";

export const GET = auth(
  withAuthorisation(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
    params: Promise<{ fileId: string }>
  ) {
    try {
      const { fileId } = await params;

      // Load file from disk
      const fileData = await loadFileFromDiskById(fileId, session.user.id);

      if (fileData.error) {
        return fileData.error;
      }

      // Set appropriate headers for PDF viewing
      const headers = new Headers();
      headers.set("Content-Type", fileData.fileRecord.file_type);
      headers.set("Content-Disposition", `inline; filename="${fileData.fileRecord.name}"`);

      return new NextResponse(fileData.fileBuffer, {
        status: 200,
        headers
      });
    } catch (error) {
      console.error("Error viewing file:", error);
      return NextResponse.json(
        { error: "Failed to load file" },
        { status: 500 }
      );
    }
  })
);
