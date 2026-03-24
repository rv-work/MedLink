// utils/geminiUtils.js
import { GoogleGenAI } from '@google/genai';

// Initialize the new Google Gen AI SDK
// Ensure process.env.GEMINI_API_KEY is set in your environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Simplifies a medical answer for a layperson.
 */
export async function simplifyAnswer(originalAnswer) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `You are an expert at explaining complex medical information to normal people.
          Rewrite the following answer in very simple, everyday language so that even a non-medical person can understand.
          Use short sentences. Avoid medical jargon unless absolutely necessary, and if you use it, explain it.
          Add small, practical examples to make it easier to understand.
          
          Original Answer:
          ${originalAnswer}`
        }]
      }]
    });

    return response.text;
  } catch (error) {
    console.error('Error simplifying answer:', error);
    return originalAnswer; // Fallback to original if AI fails
  }
}

/**
 * Transforms a follow-up query into a standalone query using chat history.
 */
export async function transformQuery(question, history) {
  const tempHistory = [...history];
  tempHistory.push({
    role: 'user',
    parts: [{ text: question }]
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: tempHistory,
      config: {
        systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
        Only output the rewritten question and nothing else.`
      }
    });

    return response.text;
  } catch (error) {
    console.error('Error transforming query:', error);
    return question; // Fallback to original question
  }
}

/**
 * Core function to get an answer from Gemini given history and instructions.
 */
export async function getGeminiResponse(history, systemInstruction) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: history,
      config: {
        systemInstruction: systemInstruction
      }
    });

    return response.text;
  } catch (error) {
    console.error('Error getting Gemini response:', error);
    throw error;
  }
}