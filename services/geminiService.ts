import { GoogleGenAI, Type } from "@google/genai";
import { AIParseResult } from "../types";

const apiKey = process.env.API_KEY || ''; // Injected by environment

export const geminiService = {
  /**
   * Parses natural language text into a structured invoice object.
   */
  parseInvoiceRequest: async (promptText: string): Promise<AIParseResult> => {
    if (!apiKey) {
      console.warn("No API Key found for Gemini");
      return { items: [] };
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Extract invoice details from the following request: "${promptText}". 
        If a client name is mentioned, extract it. 
        Extract all billable items with descriptions, quantities, and rates. 
        If rate is not specified, estimate a reasonable placeholder rate or use 0.
        If quantity is not specified, assume 1.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              clientName: {
                type: Type.STRING,
                description: "Name of the client or company to be billed",
                nullable: true
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING },
                    quantity: { type: Type.NUMBER },
                    rate: { type: Type.NUMBER }
                  },
                  required: ["description", "quantity", "rate"]
                }
              }
            },
            required: ["items"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      return JSON.parse(text) as AIParseResult;
    } catch (error) {
      console.error("Gemini Parse Error:", error);
      throw error;
    }
  }
};
