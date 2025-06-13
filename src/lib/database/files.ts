import { ObjectId } from "mongodb";
import { NotFoundError } from "@/lib/errors";
import { fileSchema } from "@/lib/schemas";
import client from "@/lib/db";

export async function getFileRecord(fileId: string, ownerId?: string) {
  const db = client.db();
  const collection = db.collection("files");
  let fileRecord;
  if (ownerId) {
    fileRecord = await collection.findOne({
      _id: new ObjectId(fileId),
      userId: ownerId,
    });
  } else {
    // public file access (maybe)
    fileRecord = await collection.findOne({ _id: new ObjectId(fileId) });
  }
  if (!fileRecord) {
    console.error("File not found in database:", fileId);
    throw new NotFoundError("File");
  }
  // Validate the file record against the schema
  const parsedFileRecord = fileSchema.safeParse(fileRecord);
  if (!parsedFileRecord.success) {
    console.error("Invalid file record format:", parsedFileRecord.error);
    throw new Error("Invalid file record format");
  }
  fileRecord = parsedFileRecord.data;
  return fileRecord;
}
