import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import client from "@/lib/db";
import { LLMSyllabusExtractor } from "@/lib/llm/syllabus";
import { withTeacherSession } from "@/lib/database-service/auth";
import { loadFileFromDiskById } from "@/lib/database-service/files";
import { MagicCreateCourseRequestSchema } from "@/lib/schemas/api";
import { AuthenticatedSession } from "@/lib/types/auth";
import { parsePdfFile } from "@/lib/chatbot";
import { reChunkOnWordCount } from "@/lib/llm/lisa";
import { addManySyllabusContent } from "@/lib/pinecone";

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

    // extract text from the PDF file
    let extractedTextArray: string[] = [];
    try {
      extractedTextArray = await parsePdfFile(loadResponse.fullPath);
    } catch (error) {
      console.error(
        "[LLM_SYLLABUS_EXTRACTOR]: Error extracting text from PDF:",
        error,
      );
      return NextResponse.json(
        {
          error:
            "Failed to extract text from PDF file. Please ensure the file is a valid PDF and try again.",
        },
        { status: 500 },
      );
    }

    let reChunkedArray: string[];
    try {
      reChunkedArray = await reChunkOnWordCount(extractedTextArray);
    } catch (error) {
      console.error("[LLM_CONTENT_EXTRACTOR]: all chunking failed: ", error);
      return NextResponse.json(
        {
          error:
            "Failed to re-chunk the extracted text. Please try again with a different file.",
        },
        { status: 500 },
      );
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

    const extractedChunkIds: string[] = [];

    for (const text of reChunkedArray) {
      const db = client.db();
      const chunkRecord = await db.collection("extracted_chunks").insertOne({
        text: text,
      });
      if (!chunkRecord.acknowledged) {
        return NextResponse.json(
          { error: "Failed to create extracted chunk record" },
          { status: 500 },
        );
      }
      extractedChunkIds.push(chunkRecord.insertedId.toString());
    }
    if (extractedChunkIds.length === 0) {
      return NextResponse.json(
        { error: "No text extracted from the PDF file" },
        { status: 400 },
      );
    }
    // Add extracted chunks to Pinecone
    try {
      await addManySyllabusContent(
        extractedChunkIds,
        reChunkedArray,
        courseRecord.insertedId.toString(),
      );
    } catch (error) {
      console.error(
        "[LLM_CONTENT_EXTRACTOR]: Error adding extracted chunks to Pinecone:",
        error,
      );
      return NextResponse.json(
        {
          error:
            "Failed to add extracted chunks to Pinecone - content cannot be used for chat bot operations",
          status: "error",
        },
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
