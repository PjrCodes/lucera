import { NextRequest, NextResponse } from "next/server";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { markMessageAsRead } from "@/lib/database-service/messages";

export async function POST(request: NextRequest) {
  try {
    const { session } = await getSessionAndUserData();

    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: "Missing messageId" },
        { status: 400 }
      );
    }

    await markMessageAsRead(messageId, session.user.id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark message as read" },
      { status: 500 }
    );
  }
}
