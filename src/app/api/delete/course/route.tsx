import { auth } from "@/lib/auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { deleteCourseById } from "@/lib/database-service/courses";
import { AuthenticatedSession } from "@/lib/types/auth";
import { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const deleteCourseRequestSchema = z.object({
  courseId: z.string().refine((val) => val.length > 0, {
    message: "Course ID is required",
  }),
});

export const DELETE = auth(
  withTeacherSession(async function DELETE(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    // Currently, the DELETE API endpoint is not implemented.
    const body = await req.json();
    const parsedBody = deleteCourseRequestSchema.safeParse(body);

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

    const { courseId } = parsedBody.data;
    // Here you would typically call a service to delete the course by ID.
    // For now, we will just return a not implemented response.
    console.log(
      `Request to delete course with ID: ${courseId} by user: ${session.user.id}`,
    );

    try {
      await deleteCourseById(courseId, session.user.id);
    } catch (error) {
      if (!(error instanceof Error)) {
        return NextResponse.json(
          { error: "Request Blocked for unknown reason" },
          { status: 500 },
        );
      }
      console.error("Error deleting course:", error);
      return NextResponse.json(
        { error: "Request Blocked: " + error.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 },
    );
  }),
);
