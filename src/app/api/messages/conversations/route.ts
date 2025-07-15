import { NextResponse } from "next/server";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { getConversationsForUser } from "@/lib/database-service/messages";

export async function GET() {
  try {
    const { session } = await getSessionAndUserData();

    const conversations = await getConversationsForUser(session.user.id);

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
