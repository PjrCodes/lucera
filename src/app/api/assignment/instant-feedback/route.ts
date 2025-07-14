import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { InstantFeedbackRequestSchema } from "@/lib/schemas/api";
import { withStudentSession } from "@/lib/database-service/auth";
import { getAssignmentById } from "@/lib/database-service/assignment";
import { loadFileFromDiskById } from "@/lib/database-service/files";
import { LLMInstantFeedback } from "@/lib/llm/instant-feedback";

export const POST = auth(
  withStudentSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      const body = await req.json();
      const parsedBody = InstantFeedbackRequestSchema.safeParse(body);

      if (!parsedBody.success) {
        return NextResponse.json(
          {
            error: parsedBody.error.issues
              .map((issue) => issue.message)
              .join(", "),
          },
          { status: 400 },
        );
      }

      const { assignmentId, submissionType, submissionContent, fileId } = parsedBody.data;

      // Validate assignment exists
      const assignment = await getAssignmentById(assignmentId);
      if (!assignment) {
        return NextResponse.json(
          { error: "Assignment not found" },
          { status: 404 },
        );
      }

      // Check if submission type matches assignment requirements
      if (assignment.submissionType !== submissionType) {
        return NextResponse.json(
          { error: "Submission type does not match assignment requirements" },
          { status: 400 },
        );
      }

      // Validate submission content based on type
      if (submissionType === "text_entry") {
        if (!submissionContent || submissionContent.trim().length === 0) {
          return NextResponse.json(
            { error: "Submission content is required for text submissions" },
            { status: 400 },
          );
        }
      } else if (submissionType === "file_upload") {
        if (!fileId) {
          return NextResponse.json(
            { error: "File ID is required for file submissions" },
            { status: 400 },
          );
        }
      }

      // Load file if it's a file submission
      let fileBuffer: Buffer | undefined;
      let fileName: string | undefined;
      let mimeType: string | undefined;

      if (submissionType === "file_upload" && fileId) {
        const loadResponse = await loadFileFromDiskById(fileId, session.user.id);
        if (loadResponse.error) {
          return NextResponse.json(
            { error: "Failed to load submitted file" },
            { status: 400 },
          );
        }
        fileBuffer = loadResponse.fileBuffer;
        fileName = loadResponse.fileRecord.name;
        mimeType = loadResponse.fileRecord.file_type;
      }

      // Generate instant feedback using LLM
      const feedbackResult = await LLMInstantFeedback(
        assignment,
        submissionType,
        submissionContent,
        fileBuffer,
        fileName,
        mimeType,
      );

      if (!feedbackResult.success) {
        console.error("LLM Instant Feedback Error:", feedbackResult.error);
        return NextResponse.json(
          {
            error: "Failed to generate instant feedback. Please try again later.",
            details: feedbackResult.error
          },
          { status: 500 },
        );
      }

      return NextResponse.json({
        feedback: feedbackResult.data,
        status: "success",
      });

    } catch (error) {
      console.error("Error in instant feedback API:", error);
      return NextResponse.json(
        {
          error: "Internal server error occurred while generating feedback",
          details: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 },
      );
    }
  }),
);
