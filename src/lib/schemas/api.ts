import {z} from "zod";

export const fileIdSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
});

export const MagicCreateContentRequestSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
});
