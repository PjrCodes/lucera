import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import client from "@/lib/db";
import { auth } from "@/auth";
import { NextAuthRequest } from "next-auth";

export const POST = auth(async function POST(req: NextAuthRequest) {
  try {
    if (!req.auth) {
        return NextResponse.json(
            { status: "failed", error: "Unauthorized" },
            { status: 401 }
        );
    }
    const session = req.auth;
    if (!session.user) {
      return NextResponse.json(
        { status: "failed", error: "Unauthorized" },
        { status: 401 }
      );
    }
    // TODO: check role teacher

    const formData = await req.formData();

    const file = formData.get("file") as File;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    await fs.writeFile(`./data/uploads/${file.name}`, buffer);

    // post file upload, create the database entry

    const db = client.db();
    const collection = db.collection("files");
    const insertedObject = await collection.insertOne({
      name: file.name,
      size: file.size,
      file_type: file.type,
      path: `./data/uploads/${file.name}`,
      userId: session.user.id,
      createdAt: new Date(),
      lastModified: new Date(),
      type: "syllabus",
    });
    if (!insertedObject.acknowledged) {
      return NextResponse.json(
        { status: "failed", error: "Failed to insert file record" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { status: "success", fileId: insertedObject.insertedId.toString() },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "failed", error: e }, { status: 500 });
  }
});
