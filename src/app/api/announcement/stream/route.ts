import client from "@/lib/db";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { Announcement } from "@/lib/schemas/database";
import { getCoursesOwnedByTeacher } from "@/lib/database-service/courses";

export const dynamic = "force-dynamic";

async function* streamAnnouncements(userId: string, userRole: string, relatedCourses: string[]) {
  const db = client.db();
  const announcementsCollection = db.collection<Announcement>("announcements");

  const changeStream = announcementsCollection.watch([
    {
      $match: {
        "fullDocument.courseId": { $in: relatedCourses },
        "fullDocument.isActive": true,
        operationType: { $in: ["insert", "update", "delete"] },
      },
    },
  ]);

  try {
    for await (const change of changeStream) {
      if (change.operationType === "insert" && change.fullDocument) {
        // New announcement created - send to all users in the course
        yield `data: ${JSON.stringify({
          type: "announcement_created",
          data: change.fullDocument,
          timestamp: new Date().toISOString()
        })}\n\n`;
      } else if (change.operationType === "update" && change.fullDocument) {
        // Announcement updated - send to all users in the course
        yield `data: ${JSON.stringify({
          type: "announcement_updated", 
          data: change.fullDocument,
          timestamp: new Date().toISOString()
        })}\n\n`;
      } else if (change.operationType === "delete" || 
                 (change.operationType === "update" && change.fullDocument?.isActive === false)) {
        // Announcement deleted or deactivated
        yield `data: ${JSON.stringify({
          type: "announcement_deleted",
          data: { _id: change.documentKey._id },
          timestamp: new Date().toISOString()
        })}\n\n`;
      }
    }
  } catch (error) {
    console.error("Announcement change stream error:", error);
  } finally {
    await changeStream.close();
  }
}

export async function GET() {
  try {
    const { session, userData } = await getSessionAndUserData();

    // Get user's related courses based on role
    let relatedCourses: string[];
    if (userData.role === "teacher") {
      const teacherCourses = await getCoursesOwnedByTeacher(session.user.id);
      relatedCourses = teacherCourses.map(course => course._id.toString());
    } else {
      relatedCourses = userData.relatedCourses;
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const iterator = streamAnnouncements(session.user.id, userData.role, relatedCourses);

        try {
          for await (const chunk of iterator) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error("Announcement stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Announcement stream authentication error:", error);
    return new Response("Unauthorized", { status: 401 });
  }
}
