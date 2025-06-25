import {z} from "zod";

export const fileIdSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
});
