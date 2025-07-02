import { ObjectId } from "mongodb";
import * as z from "zod/v4";
import { assignmentExtractorSchema } from "./llm";

export const fileSchema = z.object({
  _id: z.instanceof(ObjectId).or(z.string()).optional(),
  name: z.string(),
  size: z.number(),
  file_type: z.string(),
  path: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  type: z.enum([
    "syllabus",
    "content",
    "assignment",
    "solved_assignment",
    "graded_assignment",
  ]),
});

export type CustomFile = z.infer<typeof fileSchema>;

export const dashboardLayoutSchema = z.object({
  leftColumn: z.array(z.string()),
  rightColumn: z.array(z.string()),
});

export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;

export const userDataSchema = z.object({
  _id: z.instanceof(ObjectId).or(z.string()),
  role: z.enum(["student", "teacher"]),
  dashboardLayout: dashboardLayoutSchema,
  id: z.string(),
  updatedAt: z.date().optional(),
  createdAt: z.date(),
  relatedCourses: z.array(z.string()),
  relatedFiles: z.array(z.string()),
  // bookmarks: z.array(z.string()),
});

export type UserData = z.infer<typeof userDataSchema>;

export const userWithDataSchema = userDataSchema.extend({
  name: z.string(),
  email: z.email(),
  image: z.string(),
  emailVerified: z.boolean().nullable(),
});

export type UserWithData = z.infer<typeof userWithDataSchema>;

export const courseUnitSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export type CourseUnit = z.infer<typeof courseUnitSchema>;

export const courseTimelineItemSchema = z.object({
  type: z.string(),
  title: z.string(),
  startDate: z.string(),
  dueDate: z.string(),
  gradeReleaseDate: z.string(),
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
  coverImage: z.string().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
  courseStartDate: z.coerce.date().nullable(),
  courseEndDate: z.coerce.date().nullable(),
  llmParsingFailed: z.boolean(),
  enrolledStudentCount: z.number(),
  completedStudentCount: z.number(),
});

export type Course = z.infer<typeof courseSchema>;

export const courseWithEmbeddedSyllabusSchema = courseSchema.extend({
  syllabusFile: fileSchema.optional(),
});

export type CourseWithEmbeddedSyllabus = z.infer<typeof courseWithEmbeddedSyllabusSchema>;

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
  type: z.enum(["content", "syllabus"]).default("content"),
});
export type Content = z.infer<typeof contentSchema>;

export type ContentWithEmbeddedFile = Content & {
  file: CustomFile;
};

export const assignmentSchema = assignmentExtractorSchema.extend({
  _id: z.instanceof(ObjectId).or(z.string()),
  courseId: z.string(),
  fileId: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Assignment = z.infer<typeof assignmentSchema>;

export type AssignmentWithEmbeddedFile = Assignment & {
  file: CustomFile;
};
