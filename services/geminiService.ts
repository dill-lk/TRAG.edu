import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatWithTragAI = async (
  message: string, 
  context?: string,
  image?: string // Base64 string
): Promise<string> => {
  try {
    // Fix: Upgrade to 'gemini-3-pro-preview' for complex reasoning/educational tasks
    const modelId = "gemini-3-pro-preview"; 
    
    const systemInstruction = `You are 'Trag AI v3.5 Platinum', a high-performance educational neural engine for Trag.edu, Sri Lanka. 
    Expertise: G.C.E Advanced Level, Ordinary Level, and Ministry of Education curricula.
    
    RESPONSE FORMAT RULES:
    1. ALWAYS use Markdown for structure (headings, bold, lists).
    2. If solving a question, use '### Solution Step X' headings.
    3. If asked for a study plan, use Tables or clearly numbered lists.
    4. Keep tone professional, encouraging, and precise.
    5. If image is provided, perform deep visual analysis of the academic text.
    
    Current System Context: ${context || 'General Educational Analysis'}.`;

    const parts: any[] = [{ text: message }];
    
    if (image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: image.split(',')[1] 
        }
      });
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Precision over creativity
      }
    });

    return response.text || "Neural link stable. No output received from logic blocks.";
  } catch (error: any) {
    if (error?.message?.includes('429')) {
      return "### [!] SYSTEM OVERLOAD\nTrag AI has reached its hourly processing capacity. Please allow **15-30 minutes** for cooldown cycle.";
    }
    console.error("Gemini Error:", error);
    return "### [!] CONNECTION ERROR\nUnable to establish stable neural link with Gemini cluster. Check network infrastructure.";
  }
};

export const fetchExamNews = async (): Promise<{ text: string; sources: any[] }> => {
  try {
    const modelId = "gemini-3-flash-preview";
    const response = await ai.models.generateContent({
      model: modelId,
      contents: "Summarize the latest critical news for Sri Lankan A/L and O/L exams (dates, results, curriculum changes). Format the result as a clean Markdown list.",
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return {
      text: response.text || "No critical updates detected in local sector.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error: any) {
    return { text: "Exam News Feed offline. Syncing with government servers paused.", sources: [] };
  }
};