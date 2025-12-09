import { GoogleGenAI } from "@google/genai";
import { EvaluationTone } from "../types";

// Strictly external: Start empty, require user input via settings
let currentApiKey = '';

const MODEL_NAME = "gemini-2.5-flash";

export const updateApiKey = (key: string) => {
  currentApiKey = key;
};

export const testConnection = async (key: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "Test connection",
    });
    return true;
  } catch (error) {
    console.error("Connection Test Failed:", error);
    return false;
  }
};

export const generateStudentEvaluation = async (
  name: string,
  category: string,
  keywords: string,
  tone: EvaluationTone,
  targetLength: number,
  customInstruction?: string,
  referenceExample?: string
): Promise<string> => {
  try {
    if (!currentApiKey) {
      throw new Error("API Key is missing. Please configure it in the settings.");
    }

    // Create instance with current key
    const ai = new GoogleGenAI({ apiKey: currentApiKey });

    const toneInstruction = tone === EvaluationTone.DESCRIPTIVE
      ? "End sentences with noun forms (e.g., ~함, ~임, ~보임) suitable for official Korean school records."
      : "End sentences with polite formal verb forms (e.g., ~합니다, ~습니다).";

    const customInstructionText = customInstruction 
      ? `7. Special Custom Instruction (Important): ${customInstruction}` 
      : "";

    const referenceInstruction = referenceExample
      ? `8. Style Reference (Very Important):
         The user has provided the following text as a "Style Reference". 
         Analyze the sentence structure, vocabulary choice, depth of detail, and flow of this reference.
         GENERATE the new evaluation for "${name}" by mimicking this specific style, but using the new keywords provided.
         
         --- REFERENCE TEXT START ---
         ${referenceExample}
         --- REFERENCE TEXT END ---`
      : "";

    const prompt = `
      Task: Write a detailed Student Record (생기부) evaluation for a student.
      Student Name: ${name}
      Category/Subject: ${category}
      Keywords/Observations: ${keywords}
      Target Length: Approximately ${targetLength} characters (Korean characters/letters).

      Guidelines:
      1. Language: Korean.
      2. Style: Professional, objective, observational, and educational.
      3. Structure: Connect the keywords naturally into a cohesive paragraph. 
      4. Length: Aim for roughly ${targetLength} characters. It doesn't need to be exact, but should be close.
      5. ${toneInstruction}
      6. Do not include introductory phrases like "Here is the evaluation". Just output the content.
      ${customInstructionText}
      ${referenceInstruction}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7, // Balance between creativity and professional structure
        topK: 40,
        topP: 0.95,
      }
    });

    // Directly access the text property
    const text = response.text;
    
    if (!text) {
      throw new Error("No content generated");
    }

    return text.trim();

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};