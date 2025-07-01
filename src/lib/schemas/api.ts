import * as z from "zod/v4";
import { dashboardLayoutSchema } from "./database";

export const MagicCreateCourseRequestSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
});

export const MagicCreateContentRequestSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

export const UpdateDashboardLayoutRequestSchema = dashboardLayoutSchema;

export const MagicCreateAssignmentRequestSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

export const UploadFileRequestSchema = z.object({
  file: z.instanceof(File).refine(file => file.size > 0 && file.type === "application/pdf", {
    message: "File is required and must not be empty. Only PDF files are allowed.",
  }),
  content_type: z.string().min(1, "Content type is required"),
})

export const InviteStudentsRequestSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  studentIds: z.array(z.string().min(1, "Student ID is required")).
    nonempty("At least one student ID is required"),
});