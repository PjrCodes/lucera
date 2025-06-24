import { NextRequest, NextResponse } from "next/server";
import { getFileRecord } from "@/lib/database/files";
import { serverSideRedirectUnauthenticated } from "@/lib/auth";
import path from "path";
import fs from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Check authentication
    const session = await serverSideRedirectUnauthenticated();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    // Get file record from database
    const fileRecord = await getFileRecord(fileId);

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Construct the full file path
    const filePath = path.join(process.cwd(), fileRecord.path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Set appropriate headers for file viewing
    const headers = new Headers();
    headers.set("Content-Type", fileRecord.file_type || "application/octet-stream");
    headers.set("Content-Length", fileBuffer.length.toString());

    // For certain file types, set inline disposition to view in browser
    const viewableTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "text/plain",
      "text/html",
      "text/css",
      "text/javascript"
    ];

    if (viewableTypes.includes(fileRecord.file_type)) {
      headers.set("Content-Disposition", `inline; filename="${fileRecord.name}"`);
    } else {
      headers.set("Content-Disposition", `attachment; filename="${fileRecord.name}"`);
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("Error viewing file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
