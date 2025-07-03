import { ObjectId } from "mongodb";
import client from "../db";
import {
  assignmentSchema,
  AssignmentWithEmbeddedFile,
} from "../schemas/database";
import { getFileRecord } from "./files";

export async function getAssignmentById(assignmentId: string) {
  const assignment = await client
    .db()
    .collection("assignment")
    .findOne({ _id: new ObjectId(assignmentId) });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  try {
    return assignmentSchema.parse(assignment);
  } catch (error) {
    console.error("Error parsing assignment:", error);
    throw new Error("Invalid assignment data format");
  }
}

export async function getAssignmentsForCourse(
  courseId: string,
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
      }),
    );

    return parsedContents;
  } catch (error) {
    console.error("Error parsing content:", error);
    throw new Error("Invalid content data format");
  }
}

// export async function getUpcomingDeadlines(userId: string) {
//   // fetches all assignments with deadlines plus or minus 30 days
//   // across all courses for the current user
//   const today = new Date();
//   const startDate = new Date(today);
//   startDate.setDate(today.getDate() - 30);
//   const endDate = new Date(today);
//   endDate.setDate(today.getDate() + 30);

//   const assignments = await client
//     .db()
//     .collection("assignment")
//     .find({
//       courseId: { $in: relatedCoursesForUser(userId) },
//       deadline: {
//         $gte: startDate,
//         $lte: endDate,
//       },
//     })
//     .toArray();

// }
