import { NextRequest, NextResponse } from "next/server";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { getConversationMessages } from "@/lib/database-service/messages";

export async function GET(request: NextRequest) {
  try {
    const { session } = await getSessionAndUserData();

    const url = new URL(request.url);
    const otherUserId = url.searchParams.get("otherUserId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, error: "Missing otherUserId parameter" },
        { status: 400 }
      );
    }

    const messages = await getConversationMessages(
      session.user.id,
      otherUserId,
      page,
      limit
    );

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}
