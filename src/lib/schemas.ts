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
  lastModified: z.date(),
  type: z.string(),
});
