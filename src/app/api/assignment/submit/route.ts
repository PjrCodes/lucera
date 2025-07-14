import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import client from "@/lib/db";
import { withStudentSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { SubmitAssignmentRequestSchema } from "@/lib/schemas/api";
import { getAssignmentById } from "@/lib/database-service/assignment";

export const POST = auth(
  withStudentSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    const body = await req.json();
    const parsedBody = SubmitAssignmentRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: parsedBody.error.issues
            .map((issue) => issue.message)
            .join(", "),
        },
        { status: 400 },
      );
    }

    const { assignmentId, submissionType, submissionContent } = parsedBody.data;

    try {
      // Validate assignment exists
      const assignment = await getAssignmentById(assignmentId);

      // Check if submission type matches assignment requirements
      if (assignment.submissionType !== submissionType) {
        return NextResponse.json(
          { error: "Submission type does not match assignment requirements" },
          { status: 400 },
        );
      }

      // Check if assignment is not overdue (optional - you might want to allow late submissions)
      if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
        // You can either block or allow with a warning
        console.warn(`Late submission for assignment ${assignmentId} by student ${session.user.id}`);
      }

      const db = client.db();
      const submittedAssignmentsCollection = db.collection("submitted_assignments");

      // Check if student has already submitted this assignment
      const existingSubmission = await submittedAssignmentsCollection.findOne({
        assignmentId: assignmentId,
        studentId: session.user.id,
      });

      if (existingSubmission) {
        return NextResponse.json(
          { error: "You have already submitted this assignment" },
          { status: 400 },
        );
      }

      // Validate submission content based on type
      if (submissionType === "text_entry") {
        if (!submissionContent || submissionContent.trim().length === 0) {
          return NextResponse.json(
            { error: "Text submission cannot be empty" },
            { status: 400 },
          );
        }
      } else if (submissionType === "file_upload") {
        // File upload will be handled separately, check if fileId is provided in request
        const fileId = body.fileId;
        if (!fileId) {
          return NextResponse.json(
            { error: "File must be uploaded for file submission" },
            { status: 400 },
          );
        }
      }

      // Create submission record
      const submissionData = {
        assignmentId: assignmentId,
        courseId: assignment.courseId,
        studentId: session.user.id,
        submissionType: submissionType,
        submissionContent: submissionType === "text_entry" ? submissionContent : null,
        submittedFileId: submissionType === "file_upload" ? body.fileId : null,
        submittedAt: new Date(),
        status: "submitted",
      };

      const submissionResult = await submittedAssignmentsCollection.insertOne(submissionData);

      if (!submissionResult.acknowledged) {
        return NextResponse.json(
          { error: "Failed to submit assignment" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        submissionId: submissionResult.insertedId.toString(),
        message: "Assignment submitted successfully",
      });

    } catch (error) {
      console.error("Error submitting assignment:", error);
      return NextResponse.json(
        { error: "Failed to submit assignment" },
        { status: 500 },
      );
    }
  }),
);
