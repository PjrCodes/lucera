import { ObjectId } from "mongodb";
import client from "../db";
import { assignmentSchema, AssignmentWithEmbeddedFile } from "../schemas/database";
import { getFileRecord } from "./files";

export async function getAssignmentById(courseId: string) {
  const course = await client
    .db()
    .collection("assignment")
    .findOne({ _id: new ObjectId(courseId) });

  if (!course) {
    throw new Error("Course not found");
  }

  try {
    return assignmentSchema.parse(course);
  } catch (error) {
    console.error("Error parsing content:", error);
    throw new Error("Invalid content data format");
  }
}

export async function getAssignmentsForCourse(
  courseId: string
): Promise<AssignmentWithEmbeddedFile[]> {
  const contents = await client
    .db()
    .collection("assignment")
    .find({ courseId: courseId })
    .toArray();

  try {
    const parsedContents = await Promise.all(
      contents.map(async (content) => {
        const parsedData = assignmentSchema.parse(content);
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
        } as AssignmentWithEmbeddedFile;
      })
    );

    return parsedContents;
  } catch (error) {
    console.error("Error parsing content:", error);
    throw new Error("Invalid content data format");
  }
}
