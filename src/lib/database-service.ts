import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { NotFoundError } from "@/lib/errors";
import { z } from "zod";
import defaults from "@/../data/defaults.json";

const fileSchema = z.object({
  _id: z.instanceof(ObjectId),
  name: z.string(),
  size: z.number(),
  file_type: z.string(),
  path: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  lastModified: z.date(),
  type: z.string(),
});

export async function getUserData(userId: string) {
  const db = client.db();
  const user = await db.collection("user_data").findOne({ id: userId });
  // if (!user) {
  //   throw new NotFoundError("User");
  // }
  return user;
}

export async function checkTeacherhood(userId: string) {
  const user = await getUserData(userId);
  return true;
  return user.role === "teacher";
}

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

export async function setDefaultDashboardLayout(
  userId: string,
  isTeacher: boolean
) {
  const db = client.db();
  const customUserDataCollection = db.collection("user_data");

  try {
    await customUserDataCollection.updateOne(
      // Use user ID from session
      { id: userId },
      {
        $set: {
          dashboardLayout:
            !isTeacher
              ? defaults.dashboardLayout.student
              : defaults.dashboardLayout.teacher,
        },
      },
      { upsert: true }
    );
    // Redirect to the profile page after successful role assignment
  } catch (error) {
    console.error("Error updating user data with dashboard layout:", error);
    throw new Error("Failed to set default dashboard layout");
  }
}
