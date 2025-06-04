import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";

interface LLMSyllabusParseResponse {
  name: string;
  description: string;
  units: string[];
  timeline: string[];
  courseStartDate: Date;
  courseEndDate: Date;
  shortDescription: string;
}

export async function LLMSyllabusParse(
  filePath: string
): Promise<LLMSyllabusParseResponse> {
  // save the text to a file for debugging purposes
  const result = await callAI(filePath);

  return {
    name: result.name,
    description: result.description,
    units: result.units,
    timeline: result.timeline,
    courseStartDate: result.courseStartDate,
    courseEndDate: result.courseEndDate,
    shortDescription: result.shortDescription || "",
  };
}

async function callAI(filePath: string) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
   const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      required: ["units", "timeline", "name", "description", "start_date", "end_date", "short_description"],
      properties: {
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
            required: ["type", "title", "start_date", "due_date", "grade_release_date", "start_date_inferred", "due_date_inferred", "grade_release_date_inferred"],
            properties: {
              type: {
                type: Type.STRING,
                enum: ["assignment", "quiz", "midsem_exam", "endsem_exam", "exam", "lab_exam", "other"],
              },
              title: {
                type: Type.STRING,
              },
              start_date: {
                type: Type.STRING,
              },
              due_date: {
                type: Type.STRING,
              },
              grade_release_date: {
                type: Type.STRING,
              },
              start_date_inferred: {
                type: Type.BOOLEAN,
              },
              due_date_inferred: {
                type: Type.BOOLEAN,
              },
              grade_release_date_inferred: {
                type: Type.BOOLEAN,
              },
            },
          },
        },
        name: {
          type: Type.STRING,
        },
        course_code: {
          type: Type.STRING,
        },
        description: {
          type: Type.STRING,
        },
        start_date: {
          type: Type.STRING,
        },
        end_date: {
          type: Type.STRING,
        },
        short_description: {
          type: Type.STRING,
        },
      },
    },
    systemInstruction: [
        {
          text: `You are a helpful document text parser which can identify patterns in text and return them as structured JSON.`,
        }
    ],
  };
  const model = "gemini-2.5-flash-preview-05-20";
  const contents = [
    {
      role: "user",
      parts: [
        {
          inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            filename: "syllabus.pdf",
            mimeType: `application/pdf`,
          },
        },
        {
//           text: `
// Attached is content from a syllabus file for a College course. Please parse the content and return the TIMELINE, TOPICS, NAME, COURSE CODE (IF ANY), description, start_date, and end_date. Start_date and End_date must be in YYYY-MM-DD format.

// - Understand the topics the course should cover if they are not directly present.
// - The timeline must relate to the topics, but also include examinations, assignments, quizzes and more. It must include their deadlines, initialisation dates, and grade releasing dates.
// - Course code can be skipped if required.
// - Description can be MARKDOWN styled. Please make good usage of headings, and more. Do not add images. You can add urls. In this markdown, please highlight grading policy, examination structure, and other related aspects if they are present.
// - Ensure that all dates returned are in the YYYY-MM-DD format. No other format is applicable.
// - If year issues are present, use the latest year. Do not give previous year data. Ensure you understand Semesters correctly. "Spring 2025" is the semester starting in January 2025, etc.
// `,
// text: `You are provided with content from a college syllabus file (attached). Please parse the content and extract the following structured data:

// 1. Course Name  
// 2. Course Code (if available, optional)  
// 3. Start Date and End Date (Format: \`YYYY-MM-DD\`)  
// 4. Description (in Markdown format, see details below)  
// 5. Topics (preferably unit-wise)  
// 6. Timeline: A detailed breakdown including:
//    - Weekly topic coverage  
//    - All Assignments, Quizzes, Tests, Midterms, Finals, Project milestones, etc.
//    - For each: include Start Date, Due Date, and if mentioned or can be reasonably inferred, Grading Date.
//    - If dates are missing, infer them based on academic calendar logic (assume a semester spans 14–16 weeks).
//    - Clearly label inferred dates as such.

// The course description should be well-structured using Markdown. Include the following sections (use \`##\` and \`###\` for formatting):

// - \`## Course Overview\`: A brief introduction to the course and its objectives.
// - \`## Learning Outcomes\`: Key takeaways or skills gained.
// - \`## Topics Covered\`: A list or table of major topics/units.
// - \`## Grading Policy\`: Use bullet points and **bold** text to highlight grading breakdown (assignments, quizzes, exams, participation, etc).
// - \`## Examination Structure\`: Detail midterm/final dates, duration, formats (MCQ, written, etc).
// - \`## Important Dates\`: Mention all critical academic deadlines and dates.
// - \`## References or Resources\`: If textbooks or links are present.

// Inference rules:

// - If semester is mentioned (e.g., Spring 2025), assume:
//   - Spring: starts first Monday of January, ends mid-May.
//   - Fall: starts first Monday of August, ends mid-December.
// - If timeline is vague or absent, infer a standard 15-week structure.
// - Assignments/quizzes/projects typically:
//   - Start week 2, then recur every 2–3 weeks.
//   - Midterm: around week 7–8.
//   - Final exam: final week of semester.
// - Grade release: 1 week after submission unless otherwise specified.

// Example timeline entry (JSON format):

// \`\`\`json
// [
//   {
//     "type": "Assignment",
//     "title": "Assignment 1: Statistical Inference",
//     "start_date": "2025-01-20",
//     "due_date": "2025-01-27",
//     "grade_release_date": "2025-02-03",
//    "grade_release_inferred": true
//   },
//   {
//     "type": "Midterm Exam",
//     "title": "Midterm",
//     "start_date": "2025-03-03",
//     "due_date": "2025-03-03",
//     "grade_release_date": "2025-03-10",
//     "grade_release_inferred": false
//   }
// ]
// \`\`\`

// Final notes:

// * All dates must use \`YYYY-MM-DD\` format only.
// * Markdown output should be visually clear, using appropriate lists, tables, and sections.
// * Do not omit any embedded or implied topics from the syllabus—even if not explicitly listed.`,


 
          text: `You are provided with content from a college syllabus file (attached). Please parse the content and extract the following structured data:

1. Course Name  
2. Course Code (if available, optional)  
3. Start Date and End Date (Format: \`YYYY-MM-DD\`)  
4. Description (in Markdown format, see details below)  
5. Short Description (text, 50-100 words maximum)
5. Units (Dividing course into 5-6 units). These should be aligned to learning progress and each unit should have a short description. Group units together as much as possible.
6. Timeline: A detailed breakdown including:
   - All Assignments, Quizzes, Tests, Midterms, Finals, Project milestones, etc.
   - For each: include Start Date, Due Date, and if mentioned or can be reasonably inferred, Grading Date.
   - If dates are missing, infer them based on academic calendar logic (assume a semester spans 14–16 weeks).
   - Clearly label inferred dates as such.

The course description should be well-structured using Markdown. Include the following sections (use \`##\` and \`###\` for formatting):

- \`## Course Overview\`: A brief introduction to the course and its objectives.
- \`## Learning Outcomes\`: Key takeaways or skills gained.
- \`## Grading Policy\`: Use bullet points and **bold** text to highlight grading breakdown (assignments, quizzes, exams, participation, etc).
- \`## Examination Structure\`: Detail midterm/final dates, duration, formats (MCQ, written, etc).
- \`## Important Dates\`: Mention all critical academic deadlines and dates.
- \`## References or Resources\`: If textbooks or links are present.

Use tables whenever you can and wherever they seem useful.

Inference rules:

- If semester is mentioned (e.g., Spring 2025), assume:
  - Spring: starts first Monday of January, ends mid-May.
  - Fall / Monsoon: starts first Monday of August, ends mid-December.
- If timeline is vague or absent, infer a standard 15-week structure. 
- Assignments/quizzes/projects typically:
  - Start week 2, then recur every 2–3 weeks.
  - Midterm: around week 7–8.
  - Final exam: final week of semester.
- Grade release: 1 week after submission unless otherwise specified.

Example timeline entry (JSON format):

\`\`\`json
[
  {
    "type": "assignment",
    "title": "Assignment 1: Statistical Inference",
    "start_date": "2025-01-20",
    "due_date": "2025-01-27",
    "grade_release_date": "2025-02-03",
   "grade_release_inferred": true
  },
  {
    "type": "midterm_exam",
    "title": "Midterm",
    "start_date": "2025-03-03",
    "due_date": "2025-03-03",
    "grade_release_date": "2025-03-10",
    "grade_release_inferred": false
  }
]
\`\`\`

Final notes:

* All dates must use \`YYYY-MM-DD\` format only.
* Markdown output should be visually clear, using appropriate lists, tables, and sections.
* Do not omit any embedded or implied topics from the syllabus—even if not explicitly listed.
* Do not add "Lectures", "Units" etc. to the timeline. Only include: assignments, quizzes, exams, field trips, etc. 
* Do not output too many topics. Think of them like units used to create a textbook.
* Ensure short description is not greater than 100 words.`,
    
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  // process response text as json
  let allText = "";
  for await (const chunk of response) {
    if (chunk.text) {
      allText += chunk.text;
    }
  }
  try {
    const parsedResponse = JSON.parse(allText);
    return {
      name: parsedResponse.name,
      description: parsedResponse.description,
      shortDescription: parsedResponse.short_description || "",
      units: parsedResponse.units,
      timeline: parsedResponse.timeline,
      courseStartDate: new Date(parsedResponse.start_date),
      courseEndDate: new Date(parsedResponse.end_date),
    };
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw new Error("Failed to parse AI response");
  }
}





// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

