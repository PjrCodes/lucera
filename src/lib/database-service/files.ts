import { ObjectId } from "mongodb";
import { NotFoundError } from "@/lib/errors";
import { fileSchema } from "@/lib/schemas/database";
import client from "@/lib/db";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { LoadFileFromDiskReturnType } from "../types/lib";

export async function getFileRecord(fileId: string, ownerId?: string) {
  const db = client.db();
  const collection = db.collection("files");
  let fileRecord;

  if (ownerId) {
    // either file is owned by the user
    fileRecord = await collection.findOne({
      _id: new ObjectId(fileId),
      userId: ownerId,
    });
    // or it is a public file
    if (!fileRecord) {
      fileRecord = await collection.findOne({
        _id: new ObjectId(fileId),
        type: { $in: ["syllabus", "assignment", "content"] },
      });
    }
    // if the file will still not be found, error will be thrown below.
  } else {
    // public file access
    fileRecord = await collection.findOne({
      _id: new ObjectId(fileId),
      type: { $in: ["syllabus", "assignment", "content"] },
    });
  }
  if (!fileRecord) {
    throw new NotFoundError("File");
  }
  // Validate the file record against the schema
  const parsedFileRecord = fileSchema.safeParse(fileRecord);
  if (!parsedFileRecord.success) {
    console.error(
      "[LIB_GET_FILE] FATAL: Invalid file record format:",
      parsedFileRecord.error
    );
    throw new Error("Invalid file database record");
  }
  fileRecord = parsedFileRecord.data;
  return fileRecord;
}

export async function loadFileFromDiskById(
  fileId: string,
  ownerId?: string
): Promise<LoadFileFromDiskReturnType> {
  let fileRecord;
  try {
    fileRecord = await getFileRecord(fileId, ownerId);
  } catch (error) {
    return { error: NextResponse.json(
      { error: "Failed to retrieve file record", detailedError: error },
      { status: 500 }
    ) 
  };
  }
  // Construct the full file path
  const filePath = path.join(process.cwd(), fileRecord.path);
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return { error: NextResponse.json(
      { error: "File not found on disk" },
      { status: 404 }
    ) };
  }
  let fileBuffer;
  try {
    // Read the file
    fileBuffer = fs.readFileSync(filePath);
  } catch {
    return {error: NextResponse.json(
      { error: "Failed to read file from disk" },
      { status: 500 }
    )};
  }

  return {fileBuffer: fileBuffer, fileRecord: fileRecord} ;
}
