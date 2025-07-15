import { NextRequest, NextResponse } from "next/server";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { sendMessage } from "@/lib/database-service/messages";

export async function POST(request: NextRequest) {
  try {
    const { session } = await getSessionAndUserData();

    const body = await request.json();
    const { receiverId, message } = body;

    if (!receiverId || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    const sentMessage = await sendMessage(session.user.id, receiverId, message.trim());

    return NextResponse.json({
      success: true,
      message: sentMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
