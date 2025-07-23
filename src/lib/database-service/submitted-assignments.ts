import { ObjectId } from "mongodb";
import client from "../db";
import {
  submittedAssignmentSchema,
  submittedAssignmentWithEmbeddedDataSchema,
  SubmittedAssignmentWithEmbeddedData,
  SubmittedAssignment,
} from "../schemas/database";
import { getAssignmentById } from "./assignment";
import { getCourseById } from "./courses";
import { getFileRecord } from "./files";

export async function getSubmittedAssignmentById(submissionId: string) {
  const submission = await client
    .db()
    .collection("submitted_assignments")
    .findOne({ _id: new ObjectId(submissionId) });

  if (!submission) {
    throw new Error("Submitted assignment not found");
  }

  try {
    return submittedAssignmentSchema.parse(submission);
  } catch (error) {
    console.error("Error parsing submitted assignment:", error);
    throw new Error("Invalid submitted assignment data format");
  }
}

export async function getSubmissionsForAssignment(
  assignmentId: string,
): Promise<SubmittedAssignmentWithEmbeddedData[]> {
  const submissions = await client
    .db()
    .collection("submitted_assignments")
    .find({ assignmentId: assignmentId })
    .toArray();

  try {
    const parsedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        const parsedData = submittedAssignmentSchema.parse(submission);
        if (parsedData._id instanceof ObjectId) {
          parsedData._id = parsedData._id.toString();
        }
        console.log("Parsed submission");
        // Get assignment details
        const assignment = await getAssignmentById(parsedData.assignmentId);
        console.log("Assignment fetched");
        // Get course details
        const course = await getCourseById(parsedData.courseId);
        console.log("Course fetched");
        // Get submitted file details if exists
        let submittedFile = null;
        if (parsedData.submittedFileId) {
          try {
            submittedFile = await getFileRecord(parsedData.submittedFileId, );
          } catch (error) {
            console.error("Error fetching submitted file details:", error);
          }
        }

        // Get student details from users collection
        const student = await client
          .db()
          .collection("users")
          .findOne({ _id: new ObjectId(parsedData.studentId) });

        return {
          ...parsedData,
          assignment: assignment,
          course: course,
          submittedFile: submittedFile,
          student: {
            id: parsedData.studentId,
            name: student?.name || "Unknown Student",
            email: student?.email || "unknown@email.com",
          },
        } as SubmittedAssignmentWithEmbeddedData;
      }),
    );

    return parsedSubmissions;
  } catch (error) {
    console.error("Error parsing submissions:", error);
    throw new Error("Invalid submission data format");
  }
}

export async function getSubmissionsForStudent(
  studentId: string,
  courseId?: string,
): Promise<SubmittedAssignmentWithEmbeddedData[]> {
  // Build the basic query object
  const query: { studentId: string; courseId?: string } = { studentId };
  if (courseId) {
    query.courseId = courseId;
  }

  // Fetch submissions using a basic find query
  const submissions = await client
    .db()
    .collection("submitted_assignments")
    .find(query)
    .toArray();

  try {
    const parsedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        const parsedData = submittedAssignmentSchema.parse(submission);
        if (parsedData._id instanceof ObjectId) {
          parsedData._id = parsedData._id.toString();
        }

        // Get assignment details
        const assignment = await getAssignmentById(parsedData.assignmentId);
        if (assignment._id instanceof ObjectId) {
          assignment._id = assignment._id.toString();
        }

        // Get course details
        const course = await getCourseById(parsedData.courseId);

        // Get submitted file details if exists
        let submittedFile = null;
        if (parsedData.submittedFileId) {
          try {
            submittedFile = await getFileRecord(parsedData.submittedFileId);
          } catch (error) {
            console.error("Error fetching submitted file details:", error);
          }
        }

        // Get student details from users collection
        const student = await client
          .db()
          .collection("users")
          .findOne({ _id: new ObjectId(parsedData.studentId) });

        return {
          ...parsedData,
          assignment,
          course,
          submittedFile,
          student: {
            id: parsedData.studentId,
            name: student?.name || "Unknown Student",
            email: student?.email || "unknown@email.com",
          },
        } as SubmittedAssignmentWithEmbeddedData;
      })
    );

    return parsedSubmissions;
  } catch (error) {
    console.error("Error parsing submissions:", error);
    throw new Error("Invalid submission data format");
  }
}

export async function checkSubmissionExists(
  assignmentId: string,
  studentId: string,
): Promise<boolean> {
  const submission = await client
    .db()
    .collection("submitted_assignments")
    .findOne({ assignmentId: assignmentId, studentId: studentId });

  return !!submission;
}

export async function getSubmissionData(
  assignmentId: string,
  studentId: string,
): Promise<SubmittedAssignment | null> {
  const submission = await client
    .db()
    .collection("submitted_assignments")
    .findOne({
      assignmentId: assignmentId,
      studentId: studentId,
    });

  if (!submission) {
    return null;
  }

  try {
    const parsedSubmission = submittedAssignmentSchema.parse(submission);
    if (parsedSubmission._id instanceof ObjectId) {
      parsedSubmission._id = parsedSubmission._id.toString();
    }
    return parsedSubmission;
  } catch (error) {
    console.error("Error parsing submission data:", error);
    throw new Error("Invalid submission data format");
  }
}

export async function updateSubmissionGrade(
  submissionId: string,
  grade: number,
  feedback?: string,
  gradedBy?: string,
  rubricGrades?: Array<{
    criteriaIndex: number;
    levelRank: number;
    points: number;
  }>,
) {
  const db = client.db();
  const updateData: {
    grade: number;
    status: string;
    gradedAt: Date;
    feedback?: string;
    gradedBy?: string;
    rubricGrades?: Array<{
      criteriaIndex: number;
      levelRank: number;
      points: number;
    }>;
  } = {
    grade: grade,
    status: "graded",
    gradedAt: new Date(),
  };

  if (feedback) updateData.feedback = feedback;
  if (gradedBy) updateData.gradedBy = gradedBy;
  if (rubricGrades) updateData.rubricGrades = rubricGrades;

  const result = await db
    .collection("submitted_assignments")
    .updateOne({ _id: new ObjectId(submissionId) }, { $set: updateData });

  if (result.modifiedCount === 0) {
    throw new Error("Failed to update submission grade");
  }

  return { success: true, message: "Grade updated successfully" };
}

export async function getStudentSubmissionForAssignment(
  studentId: string,
  assignmentId: string,
): Promise<SubmittedAssignmentWithEmbeddedData | null> {
  try {
    const submissions = await client
      .db()
      .collection("submitted_assignments")
      .aggregate([
        {
          $match: {
            studentId: studentId,
            assignmentId: assignmentId
          },
        },
        {
          $lookup: {
            from: "assignment",
            localField: "assignmentId",
            foreignField: "_id",
            as: "assignment",
          },
        },
        {
          $unwind: "$assignment",
        },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        {
          $unwind: "$course",
        },
        {
          $lookup: {
            from: "files",
            localField: "submittedFileId",
            foreignField: "_id",
            as: "submittedFile",
          },
        },
        {
          $unwind: {
            path: "$submittedFile",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();

    if (submissions.length === 0) {
      return null;
    }

    const submission = submittedAssignmentWithEmbeddedDataSchema.parse(submissions[0]);

    if (submission._id instanceof ObjectId) {
      submission._id = submission._id.toString();
    }
    if (submission.assignment._id instanceof ObjectId) {
      submission.assignment._id = submission.assignment._id.toString();
    }

    return submission;
  } catch (error) {
    console.error("Error fetching student submission:", error);
    return null;
  }
}
