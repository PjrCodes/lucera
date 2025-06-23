import { ObjectId } from "mongodb";
import { z } from "zod";

export const fileSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string(),
  size: z.number(),
  file_type: z.string(),
  path: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  type: z.string(),
});

export type CustomFile = z.infer<typeof fileSchema>;

export const dashboardLayoutSchema = z.object({
  leftColumn: z.array(z.string()),
  rightColumn: z.array(z.string()),
});

export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;

export const userDataSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  role: z.enum(["student", "teacher"]),
  dashboardLayout: dashboardLayoutSchema,
  id: z.string(),
  updatedAt: z.date().optional(),
  createdAt: z.date(),
  relatedCourses: z.array(z.string()),
  relatedFiles: z.array(z.string()),
  // bookmarks: z.array(z.string()),
})

export type UserData = z.infer<typeof userDataSchema>;
export const courseUnitSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export type CourseUnit = z.infer<typeof courseUnitSchema>;

export const courseTimelineItemSchema = z.object({
  type: z.string(),
  title: z.string(),
  start_date: z.string(),
  due_date: z.string(),
  grade_release_date: z.string(),
  start_date_inferred: z.boolean().optional(),
  due_date_inferred: z.boolean().optional(),
  grade_release_date_inferred: z.boolean().optional(),
});

export type CourseTimelineItem = z.infer<typeof courseTimelineItemSchema>;

export const courseSchema = z.object({
  _id: z.instanceof(ObjectId).or(z.string()),
  name: z.string(),
  courseCode: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  syllabusFileId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  timeline: z.array(courseTimelineItemSchema),
  units: z.array(courseUnitSchema),
  cover_image: z.string().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
  courseStartDate: z.date().nullable(),
  courseEndDate: z.date().nullable(),
  llmParsingFailed: z.boolean(),
  enrolledStudentCount: z.number(),
  completedStudentCount: z.number(),
});

export type Course = z.infer<typeof courseSchema>;

export const contentSchema = z.object({
  _id: z.instanceof(ObjectId).or(z.string()),
  title: z.string(),
  description: z.string().optional(),
  topics: z.array(z.number()).optional(),
  courseId: z.string(),
  fileId: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  shortDescription: z.string().optional(),
});
export type Content = z.infer<typeof contentSchema>;

