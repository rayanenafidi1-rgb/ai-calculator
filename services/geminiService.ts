
import { GoogleGenAI, Type } from "@google/genai";
import { AISolution } from "../types";

const SYSTEM_PROMPT = `Solve the following math problem and provide a detailed step-by-step breakdown. 
If an image is provided, identify the math problem within it first.`;

export const solveMathProblem = async (problem: string): Promise<AISolution> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nProblem: ${problem}` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problem: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of logical steps taken to solve the problem."
          },
          finalAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING, description: "A brief conceptual explanation of the solution." }
        },
        required: ["problem", "steps", "finalAnswer", "explanation"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as AISolution;
};

export const solveMathFromImage = async (base64Data: string, mimeType: string, textPrompt: string = ""): Promise<AISolution> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType
    }
  };

  const textPart = {
    text: `${SYSTEM_PROMPT} ${textPrompt ? `\nAdditional Context: ${textPrompt}` : ""}`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts: [imagePart, textPart] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problem: { type: Type.STRING, description: "The math problem identified in the image." },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Logical steps to solve the identified problem."
          },
          finalAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["problem", "steps", "finalAnswer", "explanation"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as AISolution;
};
