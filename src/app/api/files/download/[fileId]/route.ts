import { NextResponse } from "next/server";
import { loadFileFromDiskById } from "@/lib/database-service/files";
import { withAuthorisation } from "@/lib/database-service/auth";
import { NextAuthRequest } from "next-auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { auth } from "@/lib/auth";

export const GET = auth(
  withAuthorisation(async function GET(
    request: NextAuthRequest,
    session: AuthenticatedSession,
    params: Promise<{ fileId: string }>,
  ) {
    const { fileId } = await params;
    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 },
      );
    }

    // Fetch file data from the database
    const loadResponse = await loadFileFromDiskById(fileId, session.user.id);
    if (loadResponse.error) {
      return loadResponse.error;
    }

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set(
      "Content-Type",
      loadResponse.fileRecord.file_type || "application/octet-stream",
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename="${loadResponse.fileRecord.name}"`,
    );
    headers.set("Content-Length", loadResponse.fileBuffer.length.toString());
    return new NextResponse(loadResponse.fileBuffer, {
      status: 200,
      headers,
    });
  }),
);
