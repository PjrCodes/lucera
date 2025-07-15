export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // For now, return empty reminders to avoid performance issues
    // TODO: Implement efficient reminder system later
    const reminders: never[] = [];
    
    return Response.json({
      success: true,
      reminders,
      count: 0,
    });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return Response.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}
