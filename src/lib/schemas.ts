import { ObjectId } from "mongodb";
import { z } from "zod";

export const fileSchema = z.object({
  _id: z.instanceof(ObjectId),
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
})

export type UserData = z.infer<typeof userDataSchema>;

  export const courseSchema = z.object({
    _id: z.instanceof(ObjectId),
    name: z.string(),
    courseCode: z.string(),
    description: z.string(),
    shortDescription: z.string(),
    syllabusFileId: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    userId: z.string(),
    timeline: z.array(z.any()),
    units: z.array(z.any()),
    cover_image: z.string().nullable(),
    status: z.enum(["draft", "published"]).default("draft"),
    isPublished: z.boolean(),
    courseStartDate: z.date().nullable(),
    courseEndDate: z.date().nullable(),
    llmParsingFailed: z.boolean(),
    enrolledStudentCount: z.number(),
    completedStudentCount: z.number(),
    relatedContent: z.array(z.string()).default([]),
  });

  export type Course = z.infer<typeof courseSchema>;
