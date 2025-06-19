import { NextResponse } from "next/server";
import fs from "fs/promises";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import client from "@/lib/db";

import { PdfReader } from "pdfreader";
import { LLMSyllabusParse } from "@/lib/llm/llm";
import { checkTeacherhood } from "@/lib/database/auth";
import { getFileRecord } from "@/lib/database/files";

import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function readPdfText(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let allText = "";
    new PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        // End of file
        resolve(allText);
      } else if (item.text) {
        allText += item.text + " ";
      }
    });
  });
}

const schema = z.object({
  fileId: z.string().min(1, "File ID is required"),
});

// Example: Parse a course file and create a course object
export const POST = auth(async function POST(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = req.auth;
  if (!session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!(await checkTeacherhood(session.user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error processing User Data" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const parsedBody = schema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.message },
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
    let timeline, units, courseStartDate, courseEndDate, name, description, shortDescription;

    try {
      const llmResult = await LLMSyllabusParse(filePath);
      timeline = llmResult.timeline;
      units = llmResult.units;
      courseStartDate = llmResult.courseStartDate;
      courseEndDate = llmResult.courseEndDate;
      name = llmResult.name;
      description = llmResult.description;
      shortDescription = llmResult.shortDescription;
    } catch (llmError) {
      console.error("LLM parsing failed:", llmError);
      // Fallback values when LLM parsing fails
      timeline = [];
      units = [];
      courseStartDate = null;
      courseEndDate = null;
      name = `Course from ${fileRecord.name || 'uploaded file'}`;
      description = "Course description could not be automatically generated. Please edit this course to add details.";
      shortDescription = "Auto-generated course";
    }

    const db = client.db();
    const courseCollection = db.collection("courses");
    const courseRecord = await courseCollection.insertOne({
      name: name || "Unnamed Course",
      description: description || "No description provided",
      shortDescription: shortDescription || "No short description provided",
      syllabusFileId: fileId,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: session.user.id, // Assuming the user ID is available in the auth object
      timeline: timeline || [],
      units: units || [],
      cover_image: null,
      status: "draft",
      isPublished: false,
      courseStartDate: courseStartDate || null,
      courseEndDate: courseEndDate || null,
      llmParsingFailed: !timeline && !units, // Flag to indicate if LLM parsing failed
      enrolledStudentCount: 0,
      completedStudentCount: 0,
    });
    if (!courseRecord.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create course record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      courseId: courseRecord.insertedId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
});
