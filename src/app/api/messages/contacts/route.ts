import { NextResponse } from "next/server";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { getAvailableContactsForUser } from "@/lib/database-service/messages";

export async function GET() {
  try {
    const { session } = await getSessionAndUserData();

    const contacts = await getAvailableContactsForUser(session.user.id);

    return NextResponse.json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
