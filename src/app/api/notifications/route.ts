import client from "@/lib/db";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { session } = await getSessionAndUserData();
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread') === 'true';
    
    const db = client.db();
    const notificationCollection = db.collection("notifications");
    
    const filter: { userId: string; read?: { $ne: boolean } } = { userId: session.user.id };
    if (unreadOnly) {
      filter.read = { $ne: true };
    }
    
    const notifications = await notificationCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    const unreadCount = await notificationCollection.countDocuments({
      userId: session.user.id,
      read: { $ne: true }
    });
    
    return Response.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return Response.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { session } = await getSessionAndUserData();
    const body = await request.json();
    const { notificationId, read } = body;
    
    const db = client.db();
    const notificationCollection = db.collection("notifications");
    
    if (notificationId) {
      // Mark specific notification as read/unread
      await notificationCollection.updateOne(
        { _id: notificationId, userId: session.user.id },
        { $set: { read: read, readAt: read ? new Date() : null } }
      );
    } else {
      // Mark all notifications as read
      await notificationCollection.updateMany(
        { userId: session.user.id },
        { $set: { read: true, readAt: new Date() } }
      );
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return Response.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
