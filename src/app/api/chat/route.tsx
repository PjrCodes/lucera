import { NextResponse } from "next/server";
import { callLisa } from "@/lib/llm/lisa";
import { chatRequestSchema } from "@/lib/schemas/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received chat request:", body);
    // console.log(body.data);
    // validate the request body
    const parsedBody = chatRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: `Invalid request body: ${parsedBody.error}` },
        { status: 400 }
      );
    }
    const response = await callLisa(parsedBody.data);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
