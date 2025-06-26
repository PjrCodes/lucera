import {z} from "zod";
import { dashboardLayoutSchema } from "./database";

export const MagicCreateCourseRequestSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
});

export const MagicCreateContentRequestSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

export const UpdateDashboardLayoutRequestSchema = dashboardLayoutSchema;
