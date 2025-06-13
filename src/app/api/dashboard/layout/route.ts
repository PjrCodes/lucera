import { NextResponse } from "next/server";
import { NextAuthRequest } from "next-auth";
import {
  getUserDashboardLayout,
  saveDashboardLayout,
} from "@/lib/database/dashboard";
import { auth } from "@/auth";

export const GET = auth(async function GET(request: NextAuthRequest) {
  try {
    const session = request.auth;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const layout = await getUserDashboardLayout(session.user.id);
    return NextResponse.json(layout);
  } catch (error) {
    console.error("Error fetching dashboard layout:", error);
    return NextResponse.json(
      { error: "Failed to fetch layout" },
      { status: 500 }
    );
  }
});

export const POST = auth(async function POST(req: NextAuthRequest) {
  const session = req.auth;
  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const layout = await req.json();
    await saveDashboardLayout(session.user.id, layout);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving dashboard layout:", error);
    return NextResponse.json(
      { error: "Failed to save layout" },
      { status: 500 }
    );
  }
});
