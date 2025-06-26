import { NextResponse } from "next/server";
import fs from "fs/promises";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import client from "@/lib/db";
import { LLMSyllabusExtractor } from "@/lib/llm/syllabus";
import {
  withTeacherSession,
} from "@/lib/database-service/auth";
import { getFileRecord } from "@/lib/database-service/files";
import { MagicCreateCourseRequestSchema } from "@/lib/schemas/api";
import { AuthenticatedSession } from "@/lib/types/auth";
import { generateErrorMessage } from "zod-error";
// import { CourseTimelineItem } from "@/lib/schemas";

// Example: Parse a course file and create a course object
export const POST = auth(
  withTeacherSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession
  ) {
    const body = await req.json();
    const parsedBody = MagicCreateCourseRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: generateErrorMessage(parsedBody.error.issues) },
        { status: 400 }
      );
    }
    const { fileId } = parsedBody.data;

    // query from the database to get the file path
    let fileRecord;
    try {
      fileRecord = await getFileRecord(fileId, session.user.id);
    } catch {
      return NextResponse.json(
        { error: "One of several errors." },
        { status: 500 }
      );
    }
    const filePath = fileRecord.path;
    // ensure the file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return NextResponse.json(
        { error: "File does not exist", detailedError: error },
        { status: 404 }
      );
    }

    // const allText = await readPdfText(filePath);

    // Call LLM parse apis with error handling
    let timeline: object[],
      units: object[],
      courseStartDate: Date | null,
      courseEndDate: Date | null,
      name: string | null,
      description: string | null,
      shortDescription: string | null;

    const llmResult = await LLMSyllabusExtractor(filePath);
    if (!llmResult.success || !llmResult.data) {
      timeline = [];
      units = [];
      courseStartDate = null;
      courseEndDate = null;
      name = `Course from ${fileRecord.name || "uploaded file"}`;
      description =
        "Course description could not be automatically generated. Please edit this course to add details.";
      shortDescription = "Auto-generated course";
    } else {
      timeline = llmResult.data.timeline;
      units = llmResult.data.units;
      courseStartDate = llmResult.data.startDate;
      courseEndDate = llmResult.data.endDate;
      name = llmResult.data.name;
      description = llmResult.data.description;
      shortDescription = llmResult.data.shortDescription;
    }

    const db = client.db();
    const courseCollection = db.collection("courses");
    const courseRecord = await courseCollection.insertOne({
      name: name,
      description: description,
      shortDescription: shortDescription,
      syllabusFileId: fileId,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: session.user.id, // Assuming the user ID is available in the auth object
      timeline: timeline,
      units: units,
      cover_image: null,
      status: "draft",
      isPublished: false,
      courseStartDate: courseStartDate,
      courseEndDate: courseEndDate,
      llmParsingFailed: !llmResult.success,
      enrolledStudentCount: 0,
      completedStudentCount: 0,
      courseCode: "AUTOCODE",
    });
    if (!courseRecord.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create course record" },
        { status: 500 }
      );
    }

    if (!courseRecord.insertedId) {
      return NextResponse.json(
        { error: "Failed to create course record" },
        { status: 500 }
      );
    }

    const courseIdStr = courseRecord.insertedId.toString();

    // Update user's relatedCourses array
    try {
      const userCollection = db.collection("user_data");
      await userCollection.updateOne(
        { id: session.user.id },
        /* @ts-expect-error: mongodb types dont always match up */
        { $push: { relatedCourses: courseIdStr } }
      );
    } catch (userUpdateError) {
      console.error("Failed to update user relatedCourses:", userUpdateError);
      // Note: Course was created successfully, but user update failed
      // You might want to log this or handle it according to your business logic
    }

    return NextResponse.json({
      success: true,
      courseId: courseRecord.insertedId,
    });
  })
);
