import OpenAI from "openai";
import { z } from "zod";

import { extractJsonObject } from "@/lib/json";
import type { HealthStatus } from "@/types/travel";

const envSchema = z.object({
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434/v1"),
  OLLAMA_API_KEY: z.string().optional(),
  OLLAMA_MODEL: z.string().default("kimi-k2.6:cloud"),
  OLLAMA_FALLBACK_MODEL: z.string().default("qwen3.5:latest"),
  TRAVEL_SWARM_ALLOW_MOCK_FALLBACK: z
    .string()
    .default("true")
    .transform((value) => value === "true"),
});

export function getOllamaEnv() {
  return envSchema.parse({
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    OLLAMA_API_KEY: process.env.OLLAMA_API_KEY,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
    OLLAMA_FALLBACK_MODEL: process.env.OLLAMA_FALLBACK_MODEL,
    TRAVEL_SWARM_ALLOW_MOCK_FALLBACK: process.env.TRAVEL_SWARM_ALLOW_MOCK_FALLBACK,
  });
}

export function getOllamaClient() {
  const env = getOllamaEnv();

  return new OpenAI({
    apiKey: env.OLLAMA_API_KEY || "ollama",
    baseURL: env.OLLAMA_BASE_URL,
  });
}

export function getModelChain() {
  const env = getOllamaEnv();
  return [env.OLLAMA_MODEL, env.OLLAMA_FALLBACK_MODEL].filter(Boolean);
}

export async function checkOllamaHealth(): Promise<HealthStatus> {
  const env = getOllamaEnv();
  const client = getOllamaClient();

  try {
    const models = await client.models.list();
    const availableModels = models.data.map((model) => model.id);
    const activeModel =
      getModelChain().find((candidate) => availableModels.includes(candidate)) ??
      availableModels[0] ??
      env.OLLAMA_MODEL;

    return {
      ok: availableModels.length > 0,
      activeModel,
      availableModels,
      baseUrl: env.OLLAMA_BASE_URL,
      message:
        availableModels.length > 0
          ? "Ollama is reachable and ready for travel-agent runs."
          : "Ollama responded, but no models were listed on the OpenAI-compatible endpoint.",
    };
  } catch (error) {
    return {
      ok: false,
      activeModel: env.OLLAMA_MODEL,
      availableModels: [],
      baseUrl: env.OLLAMA_BASE_URL,
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach the Ollama OpenAI-compatible endpoint.",
    };
  }
}

export async function generateJson<T>(input: {
  systemPrompt: string;
  userPrompt: string;
  jsonShape: string;
  schema: z.ZodType<T>;
}) {
  const client = getOllamaClient();
  const models = getModelChain();
  const errors: string[] = [];

  for (const modelName of models) {
    try {
      const completion = await client.chat.completions.create({
        model: modelName,
        temperature: 0.7,
        messages: [
          { role: "system", content: input.systemPrompt },
          {
            role: "user",
            content: `${input.userPrompt}

Return only valid JSON that matches this shape exactly:
${input.jsonShape}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error("Model returned an empty response.");
      }

      const parsed = JSON.parse(extractJsonObject(content));
      return {
        data: input.schema.parse(parsed),
        modelName,
      };
    } catch (error) {
      errors.push(`${modelName}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  throw new Error(errors.join(" | "));
}
