import client from "@/lib/db";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { Message } from "@/lib/schemas/database";

export const dynamic = "force-dynamic";

async function* streamMessages(userId: string) {
  const db = client.db();
  const messagesCollection = db.collection<Message>("messages");

  const changeStream = messagesCollection.watch([
    {
      $match: {
        "fullDocument.receiverId": userId,
        operationType: "insert",
      },
    },
  ]);

  try {
    for await (const change of changeStream) {
      if (change.operationType === "insert") {
        yield `data: ${JSON.stringify(change.fullDocument)}\n\n`;
      }
    }
  } catch (error) {
    console.error("Change stream error:", error);
  } finally {
    await changeStream.close();
  }
}

export async function GET() {
  try {
    const { session } = await getSessionAndUserData();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const iterator = streamMessages(session.user.id);

        try {
          for await (const chunk of iterator) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error("Stream error:", error);
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
    console.error("Authentication error:", error);
    return new Response("Unauthorized", { status: 401 });
  }
}
