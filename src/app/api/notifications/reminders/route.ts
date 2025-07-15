import client from "@/lib/db";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { ReminderNotification } from "@/lib/types/notifications";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// Function to check for reminder notifications
async function checkForReminders(userId: string, userRole: string) {
  const db = client.db();
  const now = new Date();
  const reminderNotifications: ReminderNotification[] = [];

  try {
    // For teachers: Check for ungraded assignments
    if (userRole === "teacher") {
      const assignmentCollection = db.collection("assignments");
      const submissionCollection = db.collection("submissions");
      
      // Get assignments created by this teacher
      const teacherAssignments = await assignmentCollection.find({
        userId: userId,
        dueDate: { $lt: now }, // Past due date
      }).toArray();

      for (const assignment of teacherAssignments) {
        // Check for ungraded submissions
        const ungradedSubmissions = await submissionCollection.countDocuments({
          assignmentId: assignment._id.toString(),
          grade: { $exists: false }
        });

        if (ungradedSubmissions > 0) {
          // Check if we already sent this reminder recently (within 24 hours)
          const recentReminder = await db.collection("notifications").findOne({
            userId: userId,
            type: "reminder_grade_assignment",
            "assignmentId": assignment._id.toString(),
            createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
          });

          if (!recentReminder) {
            reminderNotifications.push({
              type: "reminder_grade_assignment",
              userId: userId,
              timestamp: now.toISOString(),
              title: "Grade Assignment Reminder",
              description: `You have ${ungradedSubmissions} ungraded submissions for "${assignment.title}"`,
              actionUrl: `/grade/${assignment._id}`,
              priority: "high",
            });
          }
        }
      }
    }

    // For students: Check for approaching deadlines
    if (userRole === "student") {
      const userCollection = db.collection("users");
      const user = await userCollection.findOne({ _id: new ObjectId(userId) });
      const userCourses = user?.relatedCourses || [];

      if (userCourses.length > 0) {
        const assignmentCollection = db.collection("assignments");
        const submissionCollection = db.collection("submissions");
        
        // Get upcoming assignments (due within next 48 hours)
        const upcomingDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const upcomingAssignments = await assignmentCollection.find({
          courseId: { $in: userCourses },
          dueDate: { $gte: now, $lte: upcomingDeadline }
        }).toArray();

        for (const assignment of upcomingAssignments) {
          // Check if student has already submitted
          const submission = await submissionCollection.findOne({
            assignmentId: assignment._id.toString(),
            studentId: userId
          });

          if (!submission) {
            // Check if we already sent this reminder recently (within 12 hours)
            const recentReminder = await db.collection("notifications").findOne({
              userId: userId,
              type: "reminder_deadline_approaching",
              "assignmentId": assignment._id.toString(),
              createdAt: { $gte: new Date(now.getTime() - 12 * 60 * 60 * 1000) }
            });

            if (!recentReminder) {
              const hoursUntilDue = Math.ceil((new Date(assignment.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60));
              
              reminderNotifications.push({
                type: "reminder_deadline_approaching",
                userId: userId,
                timestamp: now.toISOString(),
                title: "Assignment Due Soon",
                description: `"${assignment.title}" is due in ${hoursUntilDue} hours`,
                actionUrl: `/assignment/${assignment._id}`,
                priority: hoursUntilDue <= 12 ? "high" : "medium",
              });
            }
          }
        }
      }
    }

    // For teachers: Check for missing slide uploads (weekly reminder)
    if (userRole === "teacher") {
      const courseCollection = db.collection("courses");
      const teacherCourses = await courseCollection.find({ userId: userId }).toArray();

      for (const course of teacherCourses) {
        // Check if any content was uploaded this week
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const contentCollection = db.collection("content");
        const recentContent = await contentCollection.countDocuments({
          courseId: course._id.toString(),
          createdAt: { $gte: weekAgo }
        });

        if (recentContent === 0) {
          // Check if we already sent this reminder recently (within 7 days)
          const recentReminder = await db.collection("notifications").findOne({
            userId: userId,
            type: "reminder_upload_slides",
            "courseId": course._id.toString(),
            createdAt: { $gte: weekAgo }
          });

          if (!recentReminder) {
            reminderNotifications.push({
              type: "reminder_upload_slides",
              userId: userId,
              timestamp: now.toISOString(),
              title: "Upload Slide Deck Reminder",
              description: `No content uploaded this week for "${course.name}"`,
              actionUrl: `/course/${course._id}/upload`,
              priority: "low",
            });
          }
        }
      }
    }

    // Store new reminder notifications in database
    if (reminderNotifications.length > 0) {
      await db.collection("notifications").insertMany(
        reminderNotifications.map(notification => ({
          ...notification,
          read: false,
          createdAt: now,
        }))
      );
    }

    return reminderNotifications;
  } catch (error) {
    console.error("Error checking for reminders:", error);
    return [];
  }
}

export async function GET() {
  try {
    const { session, userData } = await getSessionAndUserData();
    
    const reminders = await checkForReminders(session.user.id, userData.role);
    
    return Response.json({
      success: true,
      reminders,
      count: reminders.length,
    });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return Response.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}
