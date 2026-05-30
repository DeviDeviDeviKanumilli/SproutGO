// OpenAI vision implementation of PlantIdentifier (AI_INTEGRATION.md). Sends the
// image URL to a vision-capable model in JSON mode with a strict botanical prompt,
// then validates the response against the IdResult schema. A non-conforming or
// unparseable response is treated as a failed identification (confidence 0) rather
// than trusting invented data. The API key is read lazily so this module imports
// cleanly without credentials present.

import OpenAI from "openai";
import { z } from "zod";
import { env } from "@/lib/env";
import type { IdResult, PlantIdentifier } from "./PlantIdentifier";

const MODEL = "gpt-4o";

const SYSTEM_PROMPT =
  "You are a botanical identifier. Given a plant photo, return ONLY the single most " +
  "likely species as JSON matching this schema: " +
  '{"scientificName": string, "commonName": string|null, "family": string|null, "confidence": number}. ' +
  "`confidence` is your calibrated certainty from 0 to 1. If you cannot identify a plant, " +
  "return confidence 0. Do not invent a species to seem confident.";

const responseSchema = z.object({
  scientificName: z.string().min(1),
  commonName: z.string().nullable(),
  family: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});

const FAILED: IdResult = {
  scientificName: "",
  commonName: null,
  family: null,
  confidence: 0,
};

export class OpenAIPlantIdentifier implements PlantIdentifier {
  async identify(imageUrl: string): Promise<IdResult> {
    const client = new OpenAI({ apiKey: env.openaiApiKey });
    const completion = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Identify the plant in this image." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message.content;
    if (!raw) return FAILED;

    const parsed = responseSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || parsed.data.scientificName.trim() === "") {
      return FAILED;
    }
    return parsed.data;
  }
}
