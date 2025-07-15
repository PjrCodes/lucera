import * as z from "zod/v4";
import {
  courseTimelineItemSchema,
  courseUnitSchema,
  dashboardLayoutSchema,
} from "./database";

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
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: "File is required and must not be empty.",
    }),
  content_type: z.string().min(1, "Content type is required"),
}).refine((data) => {
  // For syllabus and content uploads, require PDF
  if (["syllabus", "content"].includes(data.content_type)) {
    return data.file.type === "application/pdf";
  }

  // For assignment submissions, allow PDF, DOC, DOCX
  if (data.content_type === "solved_assignment") {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    return allowedTypes.includes(data.file.type);
  }

  // For course covers, allow common image formats
  if (data.content_type === "course_cover") {
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/webp",
      "image/gif"
    ];
    return allowedImageTypes.includes(data.file.type);
  }

  // For other types, default to PDF only
  return data.file.type === "application/pdf";
}, {
  message: "Invalid file type for the specified content type.",
  path: ["file"]
});

export const InviteStudentsRequestSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  studentIds: z
    .array(z.string().min(1, "Student ID is required"))
    .nonempty("At least one student ID is required"),
});

export const SaveCourseRequestSchema = z.union([
  /** ---------- CREATE: `_id` is _explicitly_ null, so everything is required ---------- */
  z.object({
    _id: z.literal(null),
    data: z.object({
      name: z.string(),
      shortDescription: z.string(),
      description: z.string(),
      courseCode: z.string(),
      courseStartDate: z.string().nullable(),
      courseEndDate: z.string().nullable(),
      units: z.array(courseUnitSchema),
      timeline: z.array(courseTimelineItemSchema),
    }),
  }),

  /** ---------- UPDATE / PATCH: `_id` is a string _or_ omitted, so the rest is optional ---------- */
  z.object({
    _id: z.string(),
    data: z.object({
      name: z.string().optional(),
      shortDescription: z.string().optional(),
      description: z.string().optional(),
      courseCode: z.string().optional(),
      courseStartDate: z.string().nullable().optional(),
      courseEndDate: z.string().nullable().optional(),
      units: z.array(courseUnitSchema).optional(),
      timeline: z.array(courseTimelineItemSchema).optional(),
    }),
  }),
]);

export const SaveContentRequestSchema = z.object({
  _id: z.string().nullable(),
  data: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    courseId: z.string().min(1, "Course ID is required"),
    topics: z.array(z.number()).min(1, "At least one topic must be selected"),
    fileId: z.string().nullable().optional(),
    // Security features
    blockDownload: z.boolean().default(false),
    blockChatbot: z.boolean().default(false),
  }),
});

export const SaveAssignmentRequestSchema = z.object({
  _id: z.string().nullable(),
  data: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    courseId: z.string().min(1),
    topics: z.array(z.number()),
    fileId: z.string().nullable(),
    startDate: z.string().nullable(),
    dueDate: z.string().nullable(),
    gradeReleaseDate: z.string().nullable(),
    submissionType: z.enum(["file_upload", "text_entry"]),
    grading: z.object({
      type: z.enum(["percentage", "pass_fail"]),
      method: z.enum(["direct", "rubric"]),
      total_points: z.number().positive(),
      rubric: z
        .object({
          criteria: z.array(
            z.object({
              description: z.string(),
              points: z.number(),
            }),
          ),
          level: z.array(
            z.object({
              description: z.string(),
              rank: z.number(),
            }),
          ),
        })
        .optional(),
    }),
    // Security features
    blockDownload: z.boolean().default(false),
    blockChatbot: z.boolean().default(false),
  }),
});

export const CreateBookmarkRequestSchema = z.object({
  type: z.enum(["assignment", "content", "course"]),
  relatedId: z.string().min(1, "Related ID is required"),
});

export const DeleteBookmarkRequestSchema = z.object({
  bookmarkId: z.string().min(1, "Bookmark ID is required"),
});

export type SaveContentRequest = z.infer<typeof SaveContentRequestSchema>;
export type CreateBookmarkRequest = z.infer<typeof CreateBookmarkRequestSchema>;
export type DeleteBookmarkRequest = z.infer<typeof DeleteBookmarkRequestSchema>;

export const chatRequestSchema = z.object({
  courseIds: z.array(z.string()),
  contentTypes: z.array(
    z.enum(["announcement", "content", "assignment", "syllabus"]),
  ),
  query: z.string().min(1, "Query is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const SubmitAssignmentRequestSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  submissionType: z.enum(["file_upload", "text_entry"]),
  submissionContent: z.string().optional(), // For text submissions
  // fileId will be handled separately through file upload
});

export const InstantFeedbackRequestSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  submissionType: z.enum(["file_upload", "text_entry"]),
  submissionContent: z.string().optional(), // For text submissions
  fileId: z.string().optional(), // For file submissions
});

export type SubmitAssignmentRequest = z.infer<typeof SubmitAssignmentRequestSchema>;
export type InstantFeedbackRequest = z.infer<typeof InstantFeedbackRequestSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

// Announcement API Schemas
export const CreateAnnouncementRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

export const UpdateAnnouncementRequestSchema = z.object({
  _id: z.string().min(1, "Announcement ID is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

export const MarkAnnouncementReadRequestSchema = z.object({
  announcementId: z.string().min(1, "Announcement ID is required"),
});

export type CreateAnnouncementRequest = z.infer<typeof CreateAnnouncementRequestSchema>;
export type UpdateAnnouncementRequest = z.infer<typeof UpdateAnnouncementRequestSchema>;
export type MarkAnnouncementReadRequest = z.infer<typeof MarkAnnouncementReadRequestSchema>;
