import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withAuthorisation } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { updateSubmissionGrade } from "@/lib/database-service/submitted-assignments";
import { getSubmittedAssignmentById } from "@/lib/database-service/submitted-assignments";
import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { z } from "zod";

const GradeSubmissionSchema = z.object({
  grade: z.number().min(0).max(100),
  feedback: z.string().optional(),
  rubricGrades: z.array(z.object({
    criteriaIndex: z.number(),
    levelRank: z.number(),
    points: z.number()
  })).optional()
});

export const PUT = auth(
  withAuthorisation(async function PUT(
    req: NextAuthRequest,
    session: AuthenticatedSession,
    params: Promise<{ submissionId: string }>
  ) {
    try {
      const { submissionId } = await params;
      const body = await req.json();

      const validatedData = GradeSubmissionSchema.parse(body);

      // Get the submission to find the assignment
      const submission = await getSubmittedAssignmentById(submissionId);

      // Update the submission grade
      await updateSubmissionGrade(
        submissionId,
        validatedData.grade,
        validatedData.feedback,
        session.user.id,
        validatedData.rubricGrades
      );

      // Unpublish grades when a teacher changes any grade
      await client
        .db()
        .collection("assignment")
        .updateOne(
          { _id: new ObjectId(submission.assignmentId) },
          {
            $set: {
              gradesPublished: false
            },
            $unset: {
              gradesPublishedAt: "",
              gradesPublishedBy: ""
            }
          }
        );

      return NextResponse.json({
        status: "success",
        message: "Grade updated successfully. Grades have been unpublished and need to be republished."
      });
    } catch (error) {
      console.error("Error updating grade:", error);
      return NextResponse.json(
        {
          status: "failed",
          error: error instanceof Error ? error.message : "Failed to update grade"
        },
        { status: 500 }
      );
    }
  })
);
