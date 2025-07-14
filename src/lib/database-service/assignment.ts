import { ObjectId } from "mongodb";
import client from "../db";
import {
  assignmentSchema,
  AssignmentWithEmbeddedFile,
} from "../schemas/database";
import { getFileRecord } from "./files";
import { getCoursesForUser } from "./courses";
import { Deadline } from "../types/lib";

export async function getAssignmentById(assignmentId: string) {
  const assignment = await client
    .db()
    .collection("assignment")
    .findOne({ _id: new ObjectId(assignmentId) });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  try {
    // Clean up null values for optional fields to make them undefined
    const cleanedAssignment = {
      ...assignment,
      gradesPublishedAt: assignment.gradesPublishedAt === null ? undefined : assignment.gradesPublishedAt,
      gradesPublishedBy: assignment.gradesPublishedBy === null ? undefined : assignment.gradesPublishedBy,
    };

    const parsedAssignment = assignmentSchema.parse(cleanedAssignment);

    // Convert ObjectId to string for client-side usage
    if (parsedAssignment._id instanceof ObjectId) {
      parsedAssignment._id = parsedAssignment._id.toString();
    }

    return parsedAssignment;
  } catch (error) {
    console.error("Error parsing assignment:", error);
    console.error("Assignment data:", assignment);
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

export async function deleteAssignmentById(assignmentId: string) {
  const db = client.db();
  const assignmentObjectId = new ObjectId(assignmentId);

  const deleteResult = await db
    .collection("assignment")
    .deleteOne({ _id: assignmentObjectId });

  if (deleteResult.deletedCount === 0) {
    throw new Error("Assignment not found or could not be deleted.");
  }

  return { success: true, message: "Assignment deleted successfully." };
}

export async function getUpcomingDeadlines(
  userId: string,
): Promise<Deadline[]> {
  const courses = await getCoursesForUser(userId);
  const courseIds = courses.map((course) => course._id.toString());

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 60);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 60);

  // 1. Get assignments with due dates in the window
  const assignments = await client
    .db()
    .collection("assignment")
    .find({
      courseId: { $in: courseIds },
      dueDate: { $gte: startDate.toISOString(), $lte: endDate.toISOString() },
    })
    .toArray();

  // 2. Get timeline items for all courses
  // Only show timeline items that are *activated* (i.e., have a dueDate or startDate in the window)
  // and are NOT type "other" and NOT type "assignment"
  const timelineDeadlines: Deadline[] = [];
  for (const course of courses) {
    if (!course.timeline) continue;
    for (const item of course.timeline) {
      // Only show if not "other" or "assignment"
      if (item.type === "other" || item.type === "assignment") {
        continue;
      }
      // Use dueDate if present, else startDate
      const dateStr = item.dueDate || item.startDate;
      if (!dateStr) continue;
      const date = new Date(dateStr);
      if (date < startDate || date > endDate) continue;

      // Compose color (fallback if not present)
      const courseColor = "bg-primary-200 text-primary-800"; // TODO: change

      timelineDeadlines.push({
        id: Math.random(), // Not persisted, so random is fine
        title: item.title,
        dueDate: dateStr,
        course: course.name,
        type: item.type,
        courseColor,
      });
    }
  }

  // 3. Map assignments to Deadline[]
  const assignmentDeadlines: Deadline[] = assignments.map((a) => {
    const course = courses.find((c) => c._id.toString() === a.courseId);
    const courseColor = "bg-primary-200 text-primary-800"; // TODO: change
    return {
      id: Math.random(),
      title: a.title,
      dueDate: a.dueDate,
      course: course?.name || a.courseId,
      type: "assignment",
      courseColor,
    };
  });

  // 4. Combine and sort all deadlines by dueDate ascending
  const allDeadlines = [...assignmentDeadlines, ...timelineDeadlines];
  allDeadlines.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );

  return allDeadlines;
}

// export async function getUpcomingAssignments(userId: string) {
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
//       courseId: {
//         $in: (
//           await getCoursesForUser(userId)
//         ).map((course) => course._id.toString()),
//       },
//       deadline: {
//         $gte: startDate,
//         $lte: endDate,
//       },
//     })
//     .toArray();

//   try {
//     const parsedAssignments = await Promise.all(
//       assignments.map(async (assignment) => {
//         const parsedData = assignmentSchema.parse(assignment);
//         if (parsedData._id instanceof ObjectId) {
//           parsedData._id = parsedData._id.toString();
//         }

//         return parsedData;
//       })
//     );

//     return parsedAssignments;
//   } catch (error) {
//     console.error("Error parsing assignments:", error);
//     throw new Error("Invalid assignment data format");
//   }
// }
