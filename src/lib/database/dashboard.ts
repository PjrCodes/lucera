import { getUserData } from "@/lib/database/auth";
import client from "@/lib/db";
import defaults from "@/appdata/defaults.json";

export interface DashboardLayout {
  leftColumn: string[];
  rightColumn: string[];
}

export async function getUserDashboardLayout(userId: string): Promise<DashboardLayout> {
  try {
    const userData = await getUserData(userId);

    if (userData.dashboardLayout) {
      return userData.dashboardLayout;
    }

    // If no custom layout exists, return default based on user role
    const isTeacher = userData.role === "teacher";
    return isTeacher
      ? defaults.dashboardLayout.teacher
      : defaults.dashboardLayout.student;

  } catch (error) {
    console.error("Error fetching dashboard layout:", error);
    // Fallback to student default if user data fetch fails
    return defaults.dashboardLayout.student;
  }
}

export async function saveDashboardLayout(userId: string, layout: DashboardLayout): Promise<void> {
  const db = client.db();
  const collection = db.collection("user_data");

  try {
    await collection.updateOne(
      { id: userId },
      {
        $set: {
          dashboardLayout: layout,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error saving dashboard layout:", error);
    throw new Error("Failed to save dashboard layout");
  }
}
