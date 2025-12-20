import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { supabase } from '../supabase';

// Helper to get the API Key
const getApiKey = async (): Promise<string> => {
  try {
    // Try to get from Supabase first
    const { data } = await supabase.from('system_settings').select('value').eq('key', 'GEMINI_API_KEY').single();
    if (data?.value) return data.value;
  } catch (e) {
    console.warn("TRAG AI: Failed to fetch API key from Supabase", e);
  }
  
  // Fallback to env var or the hardcoded one from the widget (temporary measure until properly set)
  // ideally this should be in .env
  return import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDubin-_dKhQqb7-m1S4c7JsOdaWAYJMes";
};

const getGenAIClient = async () => {
  const apiKey = await getApiKey();
  return new GoogleGenerativeAI(apiKey);
};

export const streamChatWithTragAI = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  onChunk: (text: string) => void,
  context?: string,
  image?: string // Base64 string
) => {
  try {
    const genAI = await getGenAIClient();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `You are 'TRAG Study Assistant', a professional educational expert for Sri Lankan students. 
      CONTEXT: ${context || 'General Educational Analysis'}.
      FORMAT: Always use clean Markdown. Use bold for key terms. Use LaTeX for math.
      STYLE: Professional and clear. 
      BILINGUAL: Fluent in English and Sinhala.
      GOAL: Provide high-quality tutoring aligned with the Sri Lankan Ministry of Education syllabus.`
    });

    // Validate history: The first message in history must be from 'user'
    let validHistory = history.map(h => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: h.parts
    }));

    // Remove leading model messages as Google Gen AI requires history to start with 'user'
    while (validHistory.length > 0 && validHistory[0].role === 'model') {
      validHistory.shift();
    }

    const chatSession = model.startChat({
      history: validHistory,
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    });

    const parts: any[] = [{ text: newMessage }];
    
    if (image) {
      // If there's an image, we can't easily add it to a text-only chat history in the same turn for some models 
      // without using multimodal history, but gemini-1.5-flash supports it.
      // However, startChat history is text-heavy.
      // For simplicity in this specialized "solver" mode, we might want to use generateContentStream if it's a one-off image query
      // OR mix it. But let's try adding it to the parts.
       const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
       parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        });
    }

    const result = await chatSession.sendMessageStream(parts);

    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(chunkText);
    }
    return fullText;

  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    if (error.message?.includes('429')) {
      throw new Error("System is busy. Please try again in a moment.");
    }
    throw error;
  }
};

export const fetchExamNews = async (): Promise<{ text: string; sources: any[] }> => {
  try {
    const genAI = await getGenAIClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", }); // 1.5-flash is good for this
    
    // Note: 'tools' for googleSearch is supported in some versions/models. 
    // If not available, it will just generate text.
    // As of now, standard SDK support for tools implies using the tools config.
    // We will attempt a standard generation.
    
    const result = await model.generateContent(
      "Summarize the latest critical news for Sri Lankan A/L and O/L exams (dates, results, curriculum changes). Format as a clean Markdown list."
    );
    
    return {
      text: result.response.text(),
      sources: [] // Grounding metadata handling is complex in standard SDK response without specific tool setup
    };
  } catch (error: any) {
    console.error("News Error:", error);
    return { text: "Exam News Feed offline. Syncing with government servers paused.", sources: [] };
  }
};