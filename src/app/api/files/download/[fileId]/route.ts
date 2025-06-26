import { NextResponse } from "next/server";
import { getFileRecord } from "@/lib/database-service/files";
import { withAuthorisation } from "@/lib/database-service/auth";
import path from "path";
import fs from "fs";
import { NextAuthRequest } from "next-auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { auth } from "@/lib/auth";

export const GET = auth(
  withAuthorisation(async function GET(
    request: NextAuthRequest,
    session: AuthenticatedSession,
    params: Promise<{ fileId: string }>
  ) {
    const { fileId } = await params;
    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    let fileRecord;
    try {
      // Get file record from database
      fileRecord = await getFileRecord(fileId);
      if (!fileRecord) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
    } catch {
      return NextResponse.json(
        { error: "Failed to retrieve database object." },
        { status: 500 }
      );
    }
    // Construct the full file path
    const filePath = path.join(process.cwd(), fileRecord.path);
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 }
      );
    }
    let fileBuffer;
    try {
      // Read the file
      fileBuffer = fs.readFileSync(filePath);
    } catch {
      return NextResponse.json(
        { error: "Failed to read file from disk" },
        { status: 500 }
      );
    }
    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set(
      "Content-Type",
      fileRecord.file_type || "application/octet-stream"
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename="${fileRecord.name}"`
    );
    headers.set("Content-Length", fileBuffer.length.toString());
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  })
);
