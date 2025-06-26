import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import client from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { getUserData, withAuthorisation } from "@/lib/database-service/auth";
import { fileSchema } from "@/lib/schemas/database";
import { AuthenticatedSession } from "@/lib/types/auth";
import { UploadFileRequestSchema } from "@/lib/schemas/api";
import { generateErrorMessage } from "zod-error";

export const POST = auth(withAuthorisation(async function POST(req: NextAuthRequest, session: AuthenticatedSession) {
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
        { status: "failed", error: generateErrorMessage(formData.error.issues) },
        { status: 400 }
      );
    }
    const { file, content_type } = formData.data;

    const isTeacher = userData.role === "teacher";
    if (
      !isTeacher &&
      (content_type in ["syllabus", "assignment", "graded_assignment", "content"])
    ) {
      return NextResponse.json(
        { status: "failed", error: "Only teachers can upload this type of file" },
        { status: 403 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    try {
      await fs.writeFile(`./data/uploads/${file.name}`, buffer);
    } catch (e) {
      console.error("Error writing file:", e);
      return NextResponse.json(
        { status: "failed", error: "Failed to write file to disk" },
        { status: 500 }
      );
    }

    // Validate file using the schema
    const parsedFile = fileSchema.safeParse({
      name: file.name,
      size: file.size,
      file_type: file.type,
      path: `./data/uploads/${file.name}`,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: content_type,
    });

    // post file upload, create the database entry
    const db = client.db();
    const collection = db.collection("files");
    try {
      if (!parsedFile.success) {
        return NextResponse.json(
          { status: "failed", error: parsedFile.error?.message || "Invalid file data" },
          { status: 400 }
        );
      }

      const insertedObject = await collection.insertOne(parsedFile.data);

      if (!insertedObject.acknowledged) {
        return NextResponse.json(
          { status: "failed", error: "Failed to insert file record" },
          { status: 500 }
        );
      }

      console.log("File uploaded and record created:", insertedObject);
      return NextResponse.json(
        { status: "success", fileId: insertedObject.insertedId.toString() },
        { status: 200 }
      );
    } catch (e) {
      console.error("Error inserting file record into database:", e);
      return NextResponse.json(
        {
          status: "failed",
          error: "Failed to insert file record into database",
        },
        { status: 500 }
      );
    }

}));
