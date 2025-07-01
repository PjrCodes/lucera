import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { InviteStudentsRequestSchema } from "@/lib/schemas/api";
import { NextResponse } from "next/server";
import client from "@/lib/db";

export const POST = auth(
  withTeacherSession(async function POST(req: NextAuthRequest) {
    const body = await req.json();
    const formData = await InviteStudentsRequestSchema.safeParseAsync(body);
    if (!formData.success) {
      return NextResponse.json(
        {
          status: "failed",
          message: formData.error.issues
            .map((issue) => issue.message)
            .join(", "),
        },
        { status: 400 }
      );
    }
    const { courseId, studentIds } = formData.data;

    const result = await client
      .db()
      .collection("user_data")
      .updateMany(
        { id: { $in: studentIds } },
        { $addToSet: { relatedCourses: courseId } }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { status: "failed", message: "No students were invited" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: "success", message: "Students invited successfully" },
      { status: 200 }
    );
  })
);
