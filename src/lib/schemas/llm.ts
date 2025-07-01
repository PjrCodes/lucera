import * as z from "zod/v4";

export const contentExtractorSchema = z.object({
  title: z.string(),
  description: z.string(),
  topics: z.array(z.number()),
});

export const contentExtractorLLMSchema = z.toJSONSchema(contentExtractorSchema);

export type ExtractedContent = z.infer<typeof contentExtractorSchema>;

export const syllabusExtractorSchema = z.object({
  name: z.string(),
  courseCode: z.string(),
  courseStartDate: z.iso.date(),
  courseEndDate: z.iso.date(),
  description: z.string(),
  shortDescription: z.string(),
  units: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    })
  ),
  timeline: z.array(
    z.object({
      type: z.enum([
        "assignment",
        "quiz",
        "midsem_exam",
        "endsem_exam",
        "exam",
        "lab_exam",
        "other",
        "project",
        "case study",
        "tutorial or workshop",
        "field trip",
        "guest lecture",
      ]),
      title: z.string(),
      startDate: z.string(),
      dueDate: z.string(),
      gradeReleaseDate: z.string(),
    })
  ),
});

export const syllabusExtractorLLMSchema = z.toJSONSchema(
  syllabusExtractorSchema
);

console.log(syllabusExtractorLLMSchema);

export type ExtractedSyllabus = z.infer<typeof syllabusExtractorSchema>;

export const assignmentExtractorSchema = z.object({
  title: z.string(),
  description: z.string(),
  topics: z.array(z.number()),
  startDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  gradeReleaseDate: z.string().nullable(),
  submissionType: z.enum(["file_upload", "text_entry"]),
  grading: z.object({
    type: z.enum(["percentage", "pass_fail"]),
    method: z.enum(["direct", "rubric"]),
    total_points: z.number(),
    rubric: z.object({
      criteria: z.array(
        z.object({
          description: z.string(),
          points: z.number(),
        })
      ),
      level: z.array(
        z.object({
          description: z.string(),
          rank: z.number(),
        })
      ),
    }),
  }),
});

export const assignmentExtractorLLMSchema = z.toJSONSchema(
  assignmentExtractorSchema
);

export type ExtractedAssignment = z.infer<typeof assignmentExtractorSchema>;
