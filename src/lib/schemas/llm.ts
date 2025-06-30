import { Type } from "@google/genai";
import * as z from "zod/v4";

export const contentExtractorSchema = {
  type: Type.OBJECT,
  required: ["title", "description", "topics"],
  properties: {
    title: {
      type: Type.STRING,
    },
    description: {
      type: Type.STRING,
    },
    topics: {
      type: Type.ARRAY,
      items: {
        type: Type.NUMBER,
      },
    },
  },
};

export const contentExtractorLLMResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  topics: z.array(z.number()),
});

export type ExtractedContent = z.infer<typeof contentExtractorLLMResponseSchema>;

export const syllabusExtractorSchema = {
  type: Type.OBJECT,
  required: [
    "name",
    "courseCode",
    "startDate",
    "endDate",
    "description",
    "shortDescription",
    "units",
    "timeline",
  ],
  properties: {
    name: {
      type: Type.STRING,
    },
    courseCode: {
      type: Type.STRING,
    },
    startDate: {
      type: Type.STRING,
    },
    endDate: {
      type: Type.STRING,
    },
    description: {
      type: Type.STRING,
    },
    shortDescription: {
      type: Type.STRING,
    },
    units: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["name", "description"],
        properties: {
          name: {
            type: Type.STRING,
          },
          description: {
            type: Type.STRING,
          },
        },
      },
    },
    timeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["type", "title", "startDate", "dueDate", "gradeReleaseDate"],
        properties: {
          type: {
            type: Type.STRING,
            enum: [
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
            ],
          },
          title: {
            type: Type.STRING,
          },
          startDate: {
            type: Type.STRING,
          },
          dueDate: {
            type: Type.STRING,
          },
          gradeReleaseDate: {
            type: Type.STRING,
          },
        },
      },
    },
  },
};

export const syllabusExtractorLLMResponseSchema = z.object({
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

export type ExtractedSyllabus = z.infer<typeof syllabusExtractorLLMResponseSchema>;
