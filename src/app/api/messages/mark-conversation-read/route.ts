import { NextRequest, NextResponse } from "next/server";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { markConversationAsRead } from "@/lib/database-service/messages";

export async function POST(request: NextRequest) {
  try {
    const { session } = await getSessionAndUserData();
    
    const body = await request.json();
    const { otherUserId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, error: "Missing otherUserId" },
        { status: 400 }
      );
    }

    await markConversationAsRead(session.user.id, otherUserId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark conversation as read" },
      { status: 500 }
    );
  }
}
