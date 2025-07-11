import { auth } from "@/lib/auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { deleteAssignmentById } from "@/lib/database-service/assignment";
import { AuthenticatedSession } from "@/lib/types/auth";
import { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const deleteAssignmentRequestSchema = z.object({
  assignmentId: z.string().refine((val) => val.length > 0, {
    message: "Assignment ID is required",
  }),
});

export const DELETE = auth(
  withTeacherSession(async function DELETE(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    const body = await req.json();
    const parsedBody = deleteAssignmentRequestSchema.safeParse(body);

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

    const { assignmentId } = parsedBody.data;
    console.log(
      `Request to delete assignment with ID: ${assignmentId} by user: ${session.user.id}`,
    );

    try {
      await deleteAssignmentById(assignmentId);
    } catch (error) {
      if (!(error instanceof Error)) {
        return NextResponse.json(
          { error: "Request Blocked for unknown reason" },
          { status: 500 },
        );
      }
      console.error("Error deleting assignment:", error);
      return NextResponse.json(
        { error: "Request Blocked: " + error.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { message: "Assignment deleted successfully" },
      { status: 200 },
    );
  }),
);
