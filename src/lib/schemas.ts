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
})

export type UserData = z.infer<typeof userDataSchema>;
