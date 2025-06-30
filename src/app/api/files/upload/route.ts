import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { getUserData, withAuthorisation } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { UploadFileRequestSchema } from "@/lib/schemas/api";
import { uploadFile } from "@/lib/database-service/files";

export const POST = auth(
  withAuthorisation(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession
  ) {
    let userData;
    try {
      userData = await getUserData(session.user.id);
    } catch {
      return NextResponse.json(
        { status: "failed", error: "Failed to fetch user data" },
        { status: 500 }
      );
    }
    const formData = await UploadFileRequestSchema.safeParseAsync(req.body);
    if (!formData.success) {
      return NextResponse.json(
        {
          status: "failed",
          error: formData.error.issues.map((issue) => issue.message).join(", "),
        },
        { status: 400 }
      );
    }
    const { file, content_type } = formData.data;

    const isTeacher = userData.role === "teacher";
    if (
      !isTeacher &&
      content_type in ["syllabus", "assignment", "graded_assignment", "content"]
    ) {
      return NextResponse.json(
        {
          status: "failed",
          error: "Only teachers can upload this type of file",
        },
        { status: 403 }
      );
    }

    return await uploadFile(session.user.id, file, content_type);
  })
);
