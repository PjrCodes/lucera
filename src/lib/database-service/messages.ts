import client from "@/lib/db";
import { ObjectId } from "mongodb";
import {
  Message,
  messageSchema,
  MessageWithReadStatus,
  ConversationSummary,
} from "../schemas/database";
import { getUserData } from "./auth";

export async function sendMessage(
  senderId: string,
  receiverId: string,
  message: string
): Promise<Message> {
  const db = client.db();
  const messageCollection = db.collection("messages");

  const messageData = {
    senderId,
    receiverId,
    message,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await messageCollection.insertOne(messageData);

  if (!result.acknowledged) {
    throw new Error("Failed to send message");
  }

  const createdMessage = await messageCollection.findOne({
    _id: result.insertedId,
  });

  if (!createdMessage) {
    throw new Error("Failed to retrieve sent message");
  }

  return messageSchema.parse(createdMessage);
}

export async function getConversationMessages(
  userId1: string,
  userId2: string,
  page = 1,
  limit = 50
): Promise<MessageWithReadStatus[]> {
  const db = client.db();
  const messageCollection = db.collection("messages");

  const skip = (page - 1) * limit;

  const messages = await messageCollection
    .find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  // Get read statuses
  const messageIds = messages.map(m => m._id.toString());
  const readStatuses = await db
    .collection("message_read_status")
    .find({
      messageId: { $in: messageIds },
      userId: userId1, // Current user's read status
    })
    .toArray();

  const readStatusMap = new Map(
    readStatuses.map(rs => [rs.messageId, rs])
  );

  // Get user names for display
  const usersCollection = client.db().collection("users_and_their_data");
  const [user1Data, user2Data] = await Promise.all([
    usersCollection.findOne({ id: userId1 }),
    usersCollection.findOne({ id: userId2 }),
  ]);

  const userNameMap = new Map([
    [userId1, user1Data?.name || userId1],
    [userId2, user2Data?.name || userId2],
  ]);

  const messagesWithReadStatus: MessageWithReadStatus[] = messages.map(message => {
    const readStatus = readStatusMap.get(message._id.toString());
    const parsedMessage = messageSchema.parse(message);

    return {
      ...parsedMessage,
      isRead: !!readStatus,
      readAt: readStatus?.readAt,
      senderName: userNameMap.get(parsedMessage.senderId),
      receiverName: userNameMap.get(parsedMessage.receiverId),
    };
  }).reverse(); // Reverse to show oldest first

  return messagesWithReadStatus;
}

export async function markMessageAsRead(
  messageId: string,
  userId: string
): Promise<void> {
  const db = client.db();
  const readStatusCollection = db.collection("message_read_status");

  // Check if already marked as read
  const existingReadStatus = await readStatusCollection.findOne({
    messageId,
    userId,
  });

  if (existingReadStatus) {
    return; // Already marked as read
  }

  const readStatusData = {
    messageId,
    userId,
    readAt: new Date(),
    createdAt: new Date(),
  };

  const result = await readStatusCollection.insertOne(readStatusData);

  if (!result.acknowledged) {
    throw new Error("Failed to mark message as read");
  }
}

export async function markConversationAsRead(
  currentUserId: string,
  otherUserId: string
): Promise<void> {
  const db = client.db();
  const messageCollection = db.collection("messages");
  const readStatusCollection = db.collection("message_read_status");

  // Find all unread messages from the other user
  const unreadMessages = await messageCollection
    .find({
      senderId: otherUserId,
      receiverId: currentUserId,
    })
    .toArray();

  const unreadMessageIds = unreadMessages.map(m => m._id.toString());

  // Find which of these are already marked as read
  const existingReadStatuses = await readStatusCollection
    .find({
      messageId: { $in: unreadMessageIds },
      userId: currentUserId,
    })
    .toArray();

  const alreadyReadMessageIds = new Set(
    existingReadStatuses.map(rs => rs.messageId)
  );

  // Filter out messages that are already marked as read
  const messagesToMarkAsRead = unreadMessages.filter(
    m => !alreadyReadMessageIds.has(m._id.toString())
  );

  if (messagesToMarkAsRead.length === 0) {
    return; // All messages already read
  }

  const newReadStatuses = messagesToMarkAsRead.map(message => ({
    messageId: message._id.toString(),
    userId: currentUserId,
    readAt: new Date(),
    createdAt: new Date(),
  }));

  await readStatusCollection.insertMany(newReadStatuses);
}

export async function getConversationsForUser(userId: string): Promise<ConversationSummary[]> {
  const db = client.db();
  const messageCollection = db.collection("messages");

  // Get all conversations where user is either sender or receiver
  const conversations = await messageCollection
    .aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $addFields: {
          otherUserId: {
            $cond: {
              if: { $eq: ["$senderId", userId] },
              then: "$receiverId",
              else: "$senderId",
            },
          },
        },
      },
      {
        $group: {
          _id: "$otherUserId",
          lastMessage: { $last: "$message" },
          lastMessageTime: { $last: "$createdAt" },
          messages: { $push: "$$ROOT" },
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ])
    .toArray();

  const conversationSummaries: ConversationSummary[] = [];

  for (const conv of conversations) {
    try {
      // Get other user's data from users_and_their_data collection
      const otherUserData = await db
        .collection("users_and_their_data")
        .findOne({ id: conv._id });

      if (!otherUserData) {
        console.warn(`User data not found for user ${conv._id}`);
        continue;
      }

      // Count unread messages from the other user
      const unreadMessages = await messageCollection.countDocuments({
        senderId: conv._id,
        receiverId: userId,
        _id: {
          $nin: await db
            .collection("message_read_status")
            .find({ userId })
            .map(rs => new ObjectId(rs.messageId))
            .toArray(),
        },
      });

      conversationSummaries.push({
        conversationId: `${userId}_${conv._id}`,
        otherUserId: conv._id,
        otherUserName: otherUserData.name || conv._id,
        otherUserRole: otherUserData.role || 'unknown',
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: unreadMessages,
      });
    } catch (error) {
      console.error(`Error processing conversation with user ${conv._id}:`, error);
      // Skip this conversation if user data can't be retrieved
    }
  }

  return conversationSummaries;
}

export async function getAvailableContactsForUser(userId: string): Promise<Array<{
  id: string;
  name: string;
  email: string;
  role: string;
}>> {
  const db = client.db();
  const userData = await getUserData(userId);

  if (userData.role === "teacher") {
    // Teachers can message anyone
    const allUsers = await db
      .collection("users_and_their_data")
      .find({
        id: { $ne: userId }, // Exclude self
      })
      .toArray();

    return allUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }));
  } else {
    // Students can message teachers in their courses and fellow students in same courses
    const userCourses = userData.relatedCourses;

    // Get teachers who teach courses the student is enrolled in
    const teachersInCourses = await db
      .collection("courses")
      .find({
        _id: { $in: userCourses.map(id => new ObjectId(id)) },
      })
      .toArray();

    const teacherIds = [...new Set(teachersInCourses.map(course => course.userId))];

    // Get teachers' data
    const teachers = await db
      .collection("users_and_their_data")
      .find({
        id: { $in: teacherIds },
        role: "teacher",
      })
      .toArray();

    // Get fellow students in same courses
    const fellowStudents = await db
      .collection("users_and_their_data")
      .find({
        relatedCourses: { $in: userCourses },
        role: "student",
        id: { $ne: userId }, // Exclude self
      })
      .toArray();

    const allContacts = [...teachers, ...fellowStudents];

    return allContacts.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }));
  }
}
