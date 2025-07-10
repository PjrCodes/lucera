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
      parsedFileRecord.error,
    );
    throw new Error("Invalid file database record");
  }
  fileRecord = parsedFileRecord.data;
  return fileRecord;
}

export async function loadFileFromDiskById(
  fileId: string,
  ownerId?: string,
): Promise<LoadFileFromDiskReturnType> {
  let fileRecord;
  try {
    fileRecord = await getFileRecord(fileId, ownerId);
  } catch (error) {
    return {
      error: NextResponse.json(
        { error: "Failed to retrieve file record", detailedError: error },
        { status: 500 },
      ),
    };
  }
  // Construct the full file path
  const filePath = path.join(process.cwd(), fileRecord.path);
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return {
      error: NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 },
      ),
    };
  }
  let fileBuffer;
  try {
    // Read the file
    fileBuffer = fs.readFileSync(filePath);
  } catch {
    return {
      error: NextResponse.json(
        { error: "Failed to read file from disk" },
        { status: 500 },
      ),
    };
  }

  return { fileBuffer: fileBuffer, fileRecord: fileRecord, fullPath: filePath };
}

export async function uploadFile(
  userId: string,
  file: File,
  content_type: string,
) {
  const fileBuffer = new Uint8Array(await file.arrayBuffer());

  try {
    await fs.promises.writeFile(`./data/uploads/${file.name}`, fileBuffer);
  } catch (e) {
    console.error("Error writing file:", e);
    return NextResponse.json(
      { status: "failed", error: "Failed to write file to disk" },
      { status: 500 },
    );
  }

  const parsedFile = fileSchema.safeParse({
    name: file.name,
    size: file.size,
    file_type: file.type,
    path: `./data/uploads/${file.name}`,
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: content_type,
  });

  if (!parsedFile.success) {
    return NextResponse.json(
      {
        status: "failed",
        error: parsedFile.error?.message || "Invalid file data",
      },
      { status: 400 },
    );
  }

  const db = client.db();
  const collection = db.collection("files");
  // ensure there is no ID in the parsed file data
  let insertedObject;
  try {
    // Remove _id if present and not an ObjectId

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...fileData } = parsedFile.data;
    insertedObject = await collection.insertOne(fileData);
  } catch (e) {
    console.error("Error inserting file record into database:", e);
    return NextResponse.json(
      {
        status: "failed",
        error: "Failed to insert file record into database",
      },
      { status: 500 },
    );
  }
  if (!insertedObject.acknowledged) {
    return NextResponse.json(
      { status: "failed", error: "Failed to insert file record" },
      { status: 500 },
    );
  }

  console.log("File uploaded and record created:", insertedObject);
  return NextResponse.json(
    { status: "success", fileId: insertedObject.insertedId.toString() },
    { status: 200 },
  );
}
