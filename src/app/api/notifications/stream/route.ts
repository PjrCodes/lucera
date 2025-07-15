import client from "@/lib/db";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { 
  NotificationStreamData,
  MessageNotification,
  AnnouncementNotification,
  GradeReleaseNotification,
  AssignmentReleaseNotification,
} from "@/lib/types/notifications";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { session, userData } = await getSessionAndUserData();
    const userId = session.user.id;
    const userRole = userData.role;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const db = client.db();
        
        // Set up change streams for different collections
        const messageStream = db.collection("messages").watch([
          {
            $match: {
              "fullDocument.receiverId": userId,
              operationType: "insert",
            },
          },
        ]);

        const announcementStream = db.collection("announcements").watch([
          {
            $match: {
              operationType: "insert",
            },
          },
        ]);

        const gradeStream = db.collection("grades").watch([
          {
            $match: {
              "fullDocument.studentId": userId,
              operationType: "insert",
            },
          },
        ]);

        const assignmentStream = db.collection("assignments").watch([
          {
            $match: {
              operationType: "insert",
            },
          },
        ]);

        // Helper function to get user's enrolled courses
        const getUserCourses = async () => {
          const userCollection = db.collection("users");
          const user = await userCollection.findOne({ _id: new ObjectId(userId) });
          return user?.relatedCourses || [];
        };

        // Helper function to check if announcement is relevant to user
        const isAnnouncementRelevant = async (announcementCourseId: string) => {
          const userCourses = await getUserCourses();
          return userCourses.includes(announcementCourseId);
        };

        // Helper function to check if assignment is relevant to user
        const isAssignmentRelevant = async (assignmentCourseId: string) => {
          const userCourses = await getUserCourses();
          return userCourses.includes(assignmentCourseId);
        };

        // Helper function to get notification count
        const getUnreadCount = async () => {
          const notificationCollection = db.collection("notifications");
          return await notificationCollection.countDocuments({
            userId: userId,
            read: { $ne: true }
          });
        };

        // Helper function to send notification
        const sendNotification = (data: NotificationStreamData) => {
          try {
            const message = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (error) {
            console.error("Error sending notification:", error);
          }
        };

        try {
          // Handle message notifications
          messageStream.on("change", async (change) => {
            if (change.operationType === "insert") {
              const message = change.fullDocument;
              
              const senderCollection = db.collection("users");
              const sender = await senderCollection.findOne({ _id: new ObjectId(message.senderId) });
              
              const notification: MessageNotification = {
                type: "message",
                userId: message.receiverId,
                timestamp: new Date().toISOString(),
                senderId: message.senderId,
                senderName: sender?.name || "Unknown",
                message: message.message,
                conversationId: `${message.senderId}_${message.receiverId}`,
              };

              // Store notification in database
              await db.collection("notifications").insertOne({
                ...notification,
                read: false,
                createdAt: new Date(),
              });

              const unreadCount = await getUnreadCount();
              sendNotification({ notification, unreadCount });
            }
          });

          // Handle announcement notifications
          announcementStream.on("change", async (change) => {
            if (change.operationType === "insert") {
              const announcement = change.fullDocument;
              
              // Check if announcement is relevant to this user
              if (await isAnnouncementRelevant(announcement.courseId)) {
                const notification: AnnouncementNotification = {
                  type: "announcement",
                  userId: userId,
                  timestamp: new Date().toISOString(),
                  announcementId: announcement._id.toString(),
                  title: announcement.title,
                  courseName: announcement.courseName,
                  courseCode: announcement.courseCode,
                  createdBy: announcement.createdBy,
                };

                // Store notification in database
                await db.collection("notifications").insertOne({
                  ...notification,
                  read: false,
                  createdAt: new Date(),
                });

                const unreadCount = await getUnreadCount();
                sendNotification({ notification, unreadCount });
              }
            }
          });

          // Handle grade release notifications (only for students)
          if (userRole === "student") {
            gradeStream.on("change", async (change) => {
              if (change.operationType === "insert") {
                const grade = change.fullDocument;
                
                // Get assignment details
                const assignmentCollection = db.collection("assignments");
                const assignment = await assignmentCollection.findOne({ _id: new ObjectId(grade.assignmentId) });
                
                // Get course details
                const courseCollection = db.collection("courses");
                const course = await courseCollection.findOne({ _id: new ObjectId(assignment?.courseId) });
                
                const notification: GradeReleaseNotification = {
                  type: "grade_release",
                  userId: grade.studentId,
                  timestamp: new Date().toISOString(),
                  assignmentId: grade.assignmentId,
                  assignmentTitle: assignment?.title || "Unknown Assignment",
                  courseName: course?.name || "Unknown Course",
                  grade: grade.totalPoints,
                };

                // Store notification in database
                await db.collection("notifications").insertOne({
                  ...notification,
                  read: false,
                  createdAt: new Date(),
                });

                const unreadCount = await getUnreadCount();
                sendNotification({ notification, unreadCount });
              }
            });
          }

          // Handle assignment release notifications
          assignmentStream.on("change", async (change) => {
            if (change.operationType === "insert") {
              const assignment = change.fullDocument;
              
              // Check if assignment is relevant to this user
              if (await isAssignmentRelevant(assignment.courseId)) {
                // Get course details
                const courseCollection = db.collection("courses");
                const course = await courseCollection.findOne({ _id: new ObjectId(assignment.courseId) });
                
                const notification: AssignmentReleaseNotification = {
                  type: "assignment_release",
                  userId: userId,
                  timestamp: new Date().toISOString(),
                  assignmentId: assignment._id.toString(),
                  assignmentTitle: assignment.title,
                  courseName: course?.name || "Unknown Course",
                  dueDate: assignment.dueDate,
                };

                // Store notification in database
                await db.collection("notifications").insertOne({
                  ...notification,
                  read: false,
                  createdAt: new Date(),
                });

                const unreadCount = await getUnreadCount();
                sendNotification({ notification, unreadCount });
              }
            }
          });

          // Error handlers
          messageStream.on("error", (err) => {
            console.error("Message stream error:", err);
          });

          announcementStream.on("error", (err) => {
            console.error("Announcement stream error:", err);
          });

          gradeStream.on("error", (err) => {
            console.error("Grade stream error:", err);
          });

          assignmentStream.on("error", (err) => {
            console.error("Assignment stream error:", err);
          });

        } catch (error) {
          console.error("Stream setup error:", error);
          controller.close();
        }

        // Handle client disconnect (Note: signal handling in ReadableStream is limited)
        // The cleanup will be handled automatically when the stream is closed
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return new Response("Unauthorized", { status: 401 });
  }
}
