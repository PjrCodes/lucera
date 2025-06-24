import { getUserData } from "@/lib/database/auth";
import client from "@/lib/db";
import defaults from "@/appdata/defaults.json";
import { DashboardLayout } from "@/lib/schemas";


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
    throw new Error("Failed to fetch dashboard layout");
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


export async function setDefaultDashboardLayout(
  userId: string,
  isTeacher: boolean
) {
  const db = client.db();
  const customUserDataCollection = db.collection("user_data");

  try {
    await customUserDataCollection.updateOne(
      // Use user ID from session
      { id: userId },
      {
        $set: {
          dashboardLayout:
            !isTeacher
              ? defaults.dashboardLayout.student
              : defaults.dashboardLayout.teacher,
        },
      },
      { upsert: true }
    );
    // Redirect to the profile page after successful role assignment
  } catch (error) {
    console.error("Error updating user data with dashboard layout:", error);
    throw new Error("Failed to set default dashboard layout");
  }
}
