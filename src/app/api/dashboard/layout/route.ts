import { NextResponse } from "next/server";
import { NextAuthRequest } from "next-auth";
import { saveDashboardLayout } from "@/lib/database-service/dashboard";
import { auth } from "@/lib/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { withAuthorisation } from "@/lib/database-service/auth";
import { UpdateDashboardLayoutRequestSchema } from "@/lib/schemas/api";

export const POST = auth(
  withAuthorisation(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession
  ) {
    const layout = await UpdateDashboardLayoutRequestSchema.safeParseAsync(
      await req.json()
    );
    if (!layout.success) {
      return NextResponse.json(
        { error: "Invalid layout data" },
        { status: 400 }
      );
    }

    try {
      await saveDashboardLayout(session.user.id, layout.data);
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json(
        { error: "Failed to save layout." },
        { status: 500 }
      );
    }
  })
);
