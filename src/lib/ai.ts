import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

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

export async function generateLearningPathway(goal: string): Promise<GeneratedPathway> {
  const { object } = await generateObject({
    model: openrouter(process.env.AI_MODEL || "google/gemini-2.0-pro-exp-02-05:free"),
    schema: pathwaySchema,
    prompt: `Act as an expert educator. Create a comprehensive learning pathway for the following goal: "${goal}". 
    The pathway should be structured into clear modules, each with educational content, relevant external resources (articles, videos, books), and a knowledge check quiz.
    Ensure the content is high-quality, professional, and follows pedagogical best practices.`,
  });

  return object;
}
