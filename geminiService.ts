
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { ChatMessage } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Identify an object using Gemini 3 Pro Preview for high-quality analysis.
 */
export const identifyObject = async (base64Image: string): Promise<{
  text: string, 
  name: string, 
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary', 
  points: number 
}> => {
  const ai = getAI();
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1],
          },
        },
        {
          text: `Identify this object for a 9-year-old. 
          Respond in JSON format with:
          - "name": simple name
          - "funFacts": array of 3 fun facts
          - "rarity": Choose one (Common, Uncommon, Rare, Legendary) based on how often a kid might see it in a typical backyard.
          - "points": A number from 10 to 100 based on rarity.
          - "emoji": primary emoji for it.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          funFacts: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          rarity: { type: Type.STRING },
          points: { type: Type.NUMBER },
          emoji: { type: Type.STRING },
        },
        required: ["name", "funFacts", "rarity", "points", "emoji"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  const textContent = `${data.emoji} **${data.name}**\n\n${data.funFacts.map((f: string) => `• ${f}`).join('\n')}`;
  
  return {
    text: textContent,
    name: data.name,
    rarity: data.rarity || 'Common',
    points: data.points || 10
  };
};

/**
 * Transcribe audio using Gemini 3 Flash Preview.
 */
export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio,
          },
        },
        { text: "Transcribe this spoken audio exactly." },
      ],
    },
  });
  return response.text || "";
};

/**
 * Text-to-Speech using Gemini 2.5 Flash Preview TTS.
 */
export const speakText = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say warmly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const chatWithObject = async (objectName: string, question: string, history: ChatMessage[]): Promise<string> => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the object: ${objectName}. Speak from the first person perspective. You are friendly, funny, and love explaining your "body parts" or life to a 9-year-old. Use emojis. Keep it under 60 words.`,
    },
  });
  const result = await chat.sendMessage({ message: question });
  return result.text || "I'm a bit shy right now!";
};

export const predictTransformation = async (objectName: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tell a 9-year-old what this ${objectName} will look like or become in the future. Describe the process vividly and scientifically. Keep it under 100 words. Use emojis!`,
  });
  return response.text || "Nature is still deciding what happens next!";
};

export const askWhy = async (question: string, history: ChatMessage[]): Promise<string> => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are 'Professor Spark', a friendly, enthusiastic, and curious science mentor for 9-year-old kids. Answer 'Why' questions using simple analogies. Be Socratic. Use emojis and keep responses under 150 words.",
    },
  });
  const result = await chat.sendMessage({ message: question });
  return result.text || "That's a great question!";
};

export const generateScienceStory = async (topic: string, childName: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a short adventure story where ${childName} is a scientist exploring ${topic}. Include real scientific facts. End with a fun quiz question.`,
  });
  return response.text || "Oh no, the storybook got stuck!";
};
