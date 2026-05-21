import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const DEFAULT_AI_MODEL = process.env.AI_MODEL || "openrouter/auto";
export const LEGACY_UNAVAILABLE_MODEL = "google/gemma-3-27b-it:free";

const pathwaySchema = z.object({
  title: z.string(),
  description: z.string(),
  modules: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      order: z.number(),
      resources: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          type: z.enum(["ARTICLE", "VIDEO", "BOOK"]),
        })
      ),
      quizzes: z.array(
        z.object({
          question: z.string(),
          options: z.array(z.string()),
          correctAnswer: z.string(),
        })
      ),
    })
  ),
});

export type GeneratedPathway = z.infer<typeof pathwaySchema>;

export async function generateLearningPathway(
  goal: string,
  customApiKey?: string | null,
  customModel?: string | null
): Promise<GeneratedPathway> {
  const provider = customApiKey
    ? createOpenAI({ baseURL: "https://openrouter.ai/api/v1", apiKey: customApiKey })
    : openrouter;

  const selectedModel =
    customModel && customModel !== LEGACY_UNAVAILABLE_MODEL
      ? customModel
      : DEFAULT_AI_MODEL;

  const { object } = await generateObject({
    model: provider(selectedModel),
    schema: pathwaySchema,
    prompt: `Act as an expert educator. Create a comprehensive learning pathway for the following goal: "${goal}". 
    The pathway should be structured into clear modules, each with educational content, relevant external resources (articles, videos, books), and a knowledge check quiz.
    Ensure the content is high-quality, professional, and follows pedagogical best practices.
    
    CRITICAL INSTRUCTION: You MUST output ONLY valid JSON that matches the exact schema provided. 
    DO NOT output any markdown, DO NOT wrap the output in \`\`\`json blocks.
    Start your response immediately with { and end with }.`,
  });

  return object;
}
