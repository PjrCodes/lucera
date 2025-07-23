import { ObjectId } from "mongodb";
import client from "../db";
import {
  assignmentSchema,
  AssignmentWithEmbeddedFile,
} from "../schemas/database";
import { getFileRecord } from "./files";
import { getCoursesForUser } from "./courses";
import { Deadline } from "../types/lib";

export async function getAssignmentById(
  assignmentId: string
): Promise<AssignmentWithEmbeddedFile> {
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
      gradesPublishedAt:
        assignment.gradesPublishedAt === null
          ? undefined
          : assignment.gradesPublishedAt,
      gradesPublishedBy:
        assignment.gradesPublishedBy === null
          ? undefined
          : assignment.gradesPublishedBy,
    };

    const parsedAssignment = assignmentSchema.parse(cleanedAssignment);

    // Convert ObjectId to string for client-side usage
    if (parsedAssignment._id instanceof ObjectId) {
      parsedAssignment._id = parsedAssignment._id.toString();
    }

    // Get file details if fileId exists
    let file = null;
    if (parsedAssignment.fileId) {
      try {
        file = await getFileRecord(parsedAssignment.fileId);
      } catch (error) {
        console.error("Error fetching file details:", error);
        throw new Error("File not found or invalid file ID");
      }
    }

    return {
      ...parsedAssignment,
      file: file,
    } as AssignmentWithEmbeddedFile;
  } catch (error) {
    console.error("Error parsing assignment:", error);
    console.error("Assignment data:", assignment);
    throw new Error("Invalid assignment data format");
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
  userId: string
): Promise<Deadline[]> {
  // 1. Get user data to check role
  const { getUserData } = await import("./auth");
  const userData = await getUserData(userId);
  const isTeacher = userData.role === "teacher";

  // 2. Get all courses for the user
  const courses = await getCoursesForUser(userId);

  // 3. Handle different deadline types based on user role
  if (isTeacher) {
    // Teachers see grading deadlines (when they need to finish grading)
    const assignments = await client
      .db()
      .collection("assignment")
      .find({
        courseId: {
          $in: courses.map((course) => course._id.toString()),
        },
        gradeReleaseDate: { $ne: null },
      })
      .toArray();

    // Map assignments to grading deadlines
    const gradingDeadlines: Deadline[] = assignments.map((a) => {
      const course = courses.find((c) => c._id.toString() === a.courseId);
      const courseColor =
        course?.courseColorStyle || "background-color: #e2e8f0; color: #334155;";
      return {
        id: Math.random(),
        title: `Grade "${a.title}"`,
        dueDate: a.gradeReleaseDate,
        courseCode: course?.courseCode || "UNKNOWN",
        type: "grading",
        courseColor,
        assignmentId: a._id.toString(),
        courseId: a.courseId,
      };
    });

    // Filter to next 30 days and sort
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7); // Show overdue items from 1 week ago
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 14); // Show upcoming items for 2 weeks

    const filteredDeadlines = gradingDeadlines.filter((deadline) => {
      const date = new Date(deadline.dueDate);
      return !isNaN(date.getTime()) && date >= startDate && date <= endDate;
    });

    filteredDeadlines.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    return filteredDeadlines;
  } else {
    // Students see submission deadlines (assignments, quizzes, exams)
    const assignments = await client
      .db()
      .collection("assignment")
      .find({
        courseId: {
          $in: courses.map((course) => course._id.toString()),
        },
        dueDate: { $ne: null },
      })
      .toArray();

    // Fetch timeline items from courses for other deadlines
    const timelineDeadlines: Deadline[] = [];
    for (const course of courses) {
      if (!course.timeline || course.timeline.length === 0) continue;

      for (const item of course.timeline) {
        // Skip empty timeline items
        if (!item.type || !item.title || !item.dueDate) continue;

        // Parse due date
        const date = new Date(item.dueDate);
        if (isNaN(date.getTime())) continue;

        // Filter to next 30 days (upcoming)
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 7); // Show overdue items from 1 week ago
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 14); // Show upcoming items for 2 weeks

        const dateStr = item.dueDate;
        if (date < startDate || date > endDate) continue;

        // Compose color (fallback if not present)
        const courseColor =
          course.courseColorStyle || "background-color: #e2e8f0; color: #334155;";

        timelineDeadlines.push({
          id: Math.random(), // Not persisted, so random is fine
          title: item.title,
          dueDate: dateStr,
          courseCode: course.courseCode,
          type: item.type,
          courseColor,
          courseId: course._id.toString(),
        });
      }
    }

    // Map assignments to submission deadlines
    const assignmentDeadlines: Deadline[] = assignments.map((a) => {
      const course = courses.find((c) => c._id.toString() === a.courseId);
      const courseColor =
        course?.courseColorStyle || "background-color: #e2e8f0; color: #334155;";
      return {
        id: Math.random(),
        title: a.title,
        dueDate: a.dueDate,
        courseCode: course?.courseCode || "UNKNOWN",
        type: "assignment",
        courseColor,
        assignmentId: a._id.toString(),
        courseId: a.courseId,
      };
    });

    // Combine and sort all deadlines by dueDate ascending
    const allDeadlines = [...assignmentDeadlines, ...timelineDeadlines];
    allDeadlines.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    return allDeadlines;
  }
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
