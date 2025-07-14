import { ObjectId } from "mongodb";
import client from "../db";
import { contentSchema, ContentWithEmbeddedFile } from "../schemas/database";
import { getFileRecord } from "./files";

export async function getContentById(contentId: string): Promise<ContentWithEmbeddedFile | null> {
  const content = await client
    .db()
    .collection("content")
    .findOne({ _id: new ObjectId(contentId) });

  if (!content) {
    return null;
  }

  try {
    const parsedData = contentSchema.parse(content);
    if (parsedData._id instanceof ObjectId) {
      parsedData._id = parsedData._id.toString();
    }

    // Get file details if fileId exists
    let file = null;
    if (parsedData.fileId) {
      try {
        file = await getFileRecord(parsedData.fileId);
      } catch (error) {
        console.error("Error fetching file details:", error);
        throw new Error("File not found or invalid file ID");
      }
    }

    return {
      ...parsedData,
      file: file,
    } as ContentWithEmbeddedFile;
  } catch (error) {
    console.error("Error parsing content:", error);
    throw new Error("Invalid content data format");
  }
}

export async function getContentByCourseId(courseId: string) {
  const course = await client
    .db()
    .collection("content")
    .findOne({ _id: new ObjectId(courseId) });

  if (!course) {
    throw new Error("Course not found");
  }

  try {
    return contentSchema.parse(course);
  } catch (error) {
    console.error("Error parsing content:", error);
    throw new Error("Invalid content data format");
  }
}

export async function getContentForCourse(
  courseId: string,
): Promise<ContentWithEmbeddedFile[]> {
  const contents = await client
    .db()
    .collection("content")
    .find({ courseId: courseId })
    .toArray();

  try {
    const parsedContents = await Promise.all(
      contents.map(async (content) => {
        const parsedData = contentSchema.parse(content);
        if (parsedData._id instanceof ObjectId) {
          parsedData._id = parsedData._id.toString();
        }

        // Get file details if fileId exists
        let file = null;
        if (parsedData.fileId) {
          try {
            file = await getFileRecord(parsedData.fileId);
          } catch (error) {
            console.error("Error fetching file details:", error);
            throw new Error("File not found or invalid file ID");
          }
        }

        return {
          ...parsedData,
          file: file,
        } as ContentWithEmbeddedFile;
      }),
    );

    return parsedContents;
  } catch (error) {
    console.error("Error parsing content:", error);
    throw new Error("Invalid content data format");
  }
}

export async function deleteContentById(contentId: string) {
  const db = client.db();
  const contentObjectId = new ObjectId(contentId);

  const deleteResult = await db
    .collection("content")
    .deleteOne({ _id: contentObjectId });

  if (deleteResult.deletedCount === 0) {
    throw new Error("Content not found or could not be deleted.");
  }

  return { success: true, message: "Content deleted successfully." };
}
