import { GoogleGenAI } from "@google/genai";

// This function is a generic wrapper for making calls to the Google Gemini LLM.
// It handles schema-based responses and file uploads.
export async function callLLMWithSchema(
  responseSchema: object,
  systemPrompt: string,
  userPrompt: string,
  fileDetails: {
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
  } | null,
): Promise<string> {
  const ai = new GoogleGenAI({
    // The GEMINI_API_KEY is required for authentication with the Google GenAI service.
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: "application/json",
    responseSchema: responseSchema,
    systemInstruction: [
      {
        text: systemPrompt,
      },
    ],
  };
  const model = "gemini-2.5-flash";
  const contents = [
    {
      role: "user",
      parts: fileDetails
        ? [
            {
              inlineData: {
                data: fileDetails.fileBuffer.toString("base64"),
                filename: fileDetails.fileName,
                mimeType: fileDetails.mimeType,
              },
            },
            {
              text: userPrompt,
            },
          ]
        : [
            {
              text: userPrompt,
            },
          ],
    },
  ];

  let llmTextResponse = "";
  try {
    // The function streams the response from the LLM to handle large outputs efficiently.
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    for await (const chunk of response) {
      if (chunk.text) {
        llmTextResponse += chunk.text;
      }
    }
  } catch (error) {
    console.error("[CALL_LLM]: Error generating content with LLM:", error);
    console.error("[CALL_LLM]: Returned empty response.");
    llmTextResponse = ""; // fallback error
  }

  return llmTextResponse;
}
