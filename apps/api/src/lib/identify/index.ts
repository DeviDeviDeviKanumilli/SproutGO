// Factory that selects the active PlantIdentifier. Routes call getPlantIdentifier()
// and depend only on the interface, so swapping providers never touches pipeline code.
// Falls back to the deterministic stub when OPENAI_API_KEY is absent, keeping local
// dev, CI, and tests runnable without live credentials.

import type { PlantIdentifier } from "./PlantIdentifier";
import { StubPlantIdentifier } from "./StubPlantIdentifier";
import { OpenAIPlantIdentifier } from "./OpenAIPlantIdentifier";

export type { IdResult, PlantIdentifier } from "./PlantIdentifier";

export function getPlantIdentifier(): PlantIdentifier {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIPlantIdentifier();
  }
  return new StubPlantIdentifier();
}
