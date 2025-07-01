import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import client from "@/lib/db";
import { LLMSyllabusExtractor } from "@/lib/llm/syllabus";
import { withTeacherSession } from "@/lib/database-service/auth";
import { loadFileFromDiskById } from "@/lib/database-service/files";
import { MagicCreateCourseRequestSchema } from "@/lib/schemas/api";
import { AuthenticatedSession } from "@/lib/types/auth";
// import { CourseTimelineItem } from "@/lib/schemas";

// TODO: Syllabus file added to course content database
// TODO: Fix the methodology of adding to user relatedCourses array
export const POST = auth(
  withTeacherSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    const body = await req.json();
    const parsedBody = MagicCreateCourseRequestSchema.safeParse(body);
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
    const { fileId } = parsedBody.data;

    // query from the database to get the file path
    const loadResponse = await loadFileFromDiskById(fileId, session.user.id);
    if (loadResponse.error) {
      return loadResponse.error;
    }

    const llmResult = await LLMSyllabusExtractor(loadResponse.fileBuffer);

    const {
      name = `Course from ${loadResponse.fileRecord.name || "uploaded file"}`,
      courseCode = "AG-101",
      courseStartDate = null,
      courseEndDate = null,
      description = "Course description could not be automatically generated. Please edit this course to add details.",
      shortDescription = "Auto-generated course",
      units = [],
      timeline = [],
    } = llmResult.success ? llmResult.data : {};

    const db = client.db();
    const courseCollection = db.collection("courses");
    const courseRecord = await courseCollection.insertOne({
      name: name,
      courseCode: courseCode,
      courseStartDate: courseStartDate,
      courseEndDate: courseEndDate,
      description: description,
      shortDescription: shortDescription,
      syllabusFileId: fileId,
      units: units,
      timeline: timeline,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      coverImage: null,
      status: "draft",
      llmParsingFailed: !llmResult.success,
      enrolledStudentCount: 0,
      completedStudentCount: 0,
    });
    if (!courseRecord.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create course record" },
        { status: 500 },
      );
    }

    const contentRecord = await db.collection("content").insertOne({
      courseId: courseRecord.insertedId.toString(),
      title: "Syllabus",
      description:
        "Syllabus for the course, as uploaded by the teacher during course creation.",
      topics: [], // Syllabus has no topics
      fileId: fileId,
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: "syllabus",
    });

    if (!contentRecord.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create content record" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      courseId: courseRecord.insertedId.toString(),
    });
  }),
);
