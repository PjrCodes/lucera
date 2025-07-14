import client from "@/lib/db";
import { ObjectId } from "mongodb";
import {
  Announcement,
  announcementSchema,
  AnnouncementWithReadStatus,
} from "../schemas/database";
import { getCourseById } from "./courses";

export async function createAnnouncement(
  title: string,
  content: string,
  courseId: string,
  createdBy: string
): Promise<Announcement> {
  const db = client.db();
  const announcementCollection = db.collection("announcements");

  // Get course details for denormalization
  const course = await getCourseById(courseId);

  const announcementData = {
    title,
    content,
    courseId,
    courseName: course.name,
    courseCode: course.courseCode,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };

  const result = await announcementCollection.insertOne(announcementData);

  if (!result.acknowledged) {
    throw new Error("Failed to create announcement");
  }

  const createdAnnouncement = await announcementCollection.findOne({
    _id: result.insertedId,
  });

  if (!createdAnnouncement) {
    throw new Error("Failed to retrieve created announcement");
  }

  return announcementSchema.parse(createdAnnouncement);
}

export async function updateAnnouncement(
  announcementId: string,
  title: string,
  content: string,
  courseId: string,
  updatedBy: string
): Promise<Announcement> {
  const db = client.db();
  const announcementCollection = db.collection("announcements");

  // Get course details for denormalization
  const course = await getCourseById(courseId);

  const updateData = {
    title,
    content,
    courseId,
    courseName: course.name,
    courseCode: course.courseCode,
    updatedAt: new Date(),
  };

  const result = await announcementCollection.updateOne(
    { _id: new ObjectId(announcementId), createdBy: updatedBy },
    { $set: updateData }
  );

  if (result.matchedCount === 0) {
    throw new Error("Announcement not found or you don't have permission to update it");
  }

  const updatedAnnouncement = await announcementCollection.findOne({
    _id: new ObjectId(announcementId),
  });

  if (!updatedAnnouncement) {
    throw new Error("Failed to retrieve updated announcement");
  }

  // When announcement is updated, reset all read statuses for students
  await db.collection("announcement_read_status").deleteMany({
    announcementId: announcementId,
  });

  return announcementSchema.parse(updatedAnnouncement);
}

export async function deleteAnnouncement(
  announcementId: string,
  deletedBy: string
): Promise<void> {
  const db = client.db();
  const announcementCollection = db.collection("announcements");

  const result = await announcementCollection.updateOne(
    { _id: new ObjectId(announcementId), createdBy: deletedBy },
    { $set: { isActive: false, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    throw new Error("Announcement not found or you don't have permission to delete it");
  }
}

export async function getAnnouncementsForStudent(
  userId: string,
  relatedCourses: string[]
): Promise<AnnouncementWithReadStatus[]> {
  const db = client.db();
  const announcementCollection = db.collection("announcements");

  const announcements = await announcementCollection
    .find({
      courseId: { $in: relatedCourses },
      isActive: true,
    })
    .sort({ createdAt: -1 })
    .toArray();

  // Get read statuses for the user
  const readStatuses = await db
    .collection("announcement_read_status")
    .find({
      announcementId: { $in: announcements.map(a => a._id.toString()) },
      userId: userId,
    })
    .toArray();

  const readStatusMap = new Map(
    readStatuses.map(rs => [rs.announcementId, rs])
  );

  const announcementsWithReadStatus: AnnouncementWithReadStatus[] = announcements.map(announcement => {
    const readStatus = readStatusMap.get(announcement._id.toString());
    return {
      ...announcementSchema.parse(announcement),
      isRead: !!readStatus,
      readAt: readStatus?.readAt,
    };
  });

  return announcementsWithReadStatus;
}

export async function getAnnouncementsForTeacher(
  teacherId: string,
  relatedCourses: string[]
): Promise<Announcement[]> {
  const db = client.db();
  const announcementCollection = db.collection("announcements");

  const announcements = await announcementCollection
    .find({
      courseId: { $in: relatedCourses }, // Only get announcements for courses the teacher owns
      createdBy: teacherId,
      isActive: true,
    })
    .sort({ createdAt: -1 })
    .toArray();

  return announcements.map(announcement => announcementSchema.parse(announcement));
}

export async function markAnnouncementAsRead(
  announcementId: string,
  userId: string
): Promise<void> {
  const db = client.db();
  const readStatusCollection = db.collection("announcement_read_status");

  // Check if already marked as read
  const existingReadStatus = await readStatusCollection.findOne({
    announcementId,
    userId,
  });

  if (existingReadStatus) {
    return; // Already marked as read
  }

  const readStatusData = {
    announcementId,
    userId,
    readAt: new Date(),
    createdAt: new Date(),
  };

  const result = await readStatusCollection.insertOne(readStatusData);

  if (!result.acknowledged) {
    throw new Error("Failed to mark announcement as read");
  }
}

export async function getAnnouncementById(
  announcementId: string
): Promise<Announcement> {
  const db = client.db();
  const announcementCollection = db.collection("announcements");

  const announcement = await announcementCollection.findOne({
    _id: new ObjectId(announcementId),
    isActive: true,
  });

  if (!announcement) {
    throw new Error("Announcement not found");
  }

  return announcementSchema.parse(announcement);
}
