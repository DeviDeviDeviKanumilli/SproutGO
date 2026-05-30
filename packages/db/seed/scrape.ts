// Phase A — `npm run seed:scrape` (maintainer-only, network). Reads the committed USDA NE
// checklist CSV, normalizes + caps to the target species, resolves one CC/PD Wikimedia image
// per species (cached), and writes the committed seed/plants.normalized.json + image cache.
//
// This is NOT part of db:seed: it hits external APIs and is run rarely. db:seed (seed.ts) only
// reads the JSON this produces, fully offline. See LIBRARY_SEED.md.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseUsdaCsv } from "./lib/usda";
import { normalizeRows, capToTarget } from "./lib/normalize";
import { resolveImage, type ImageCache } from "./lib/wikimedia";
import { NE_STATES } from "./lib/regions";
import { SEED_FILE_VERSION, type NormalizedSeedFile } from "./lib/types";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const RAW_CSV = here("./data/usda-ne.raw.csv");
const IMAGE_CACHE = here("./data/image-cache.json");
const OUT_JSON = here("./plants.normalized.json");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main(): Promise<void> {
  if (!existsSync(RAW_CSV)) {
    console.error(
      `[scrape] Missing ${RAW_CSV}.\n` +
        `[scrape] Export the USDA PLANTS checklist filtered to State Distribution = ` +
        `${NE_STATES.join(", ")} and save it there, then re-run. See LIBRARY_SEED.md.`,
    );
    process.exitCode = 1;
    return;
  }

  const rows = parseUsdaCsv(readFileSync(RAW_CSV, "utf8"));
  console.log(`[scrape] parsed ${rows.length} USDA rows`);

  const normalized = capToTarget(normalizeRows(rows, { regionStates: NE_STATES }));
  console.log(`[scrape] normalized → ${normalized.length} species (capped)`);

  const cache: ImageCache = existsSync(IMAGE_CACHE)
    ? (JSON.parse(readFileSync(IMAGE_CACHE, "utf8")) as ImageCache)
    : {};

  let resolved = 0;
  for (const plant of normalized) {
    const img = await resolveImage(plant.scientificName, cache);
    plant.imageUrl = img.imageUrl;
    plant.imageLicense = img.imageLicense;
    plant.imageAttribution = img.imageAttribution;
    plant.imageSourceUrl = img.imageSourceUrl;
    if (img.imageUrl) resolved += 1;
    await sleep(200); // be polite to Wikimedia
  }
  console.log(`[scrape] resolved images for ${resolved}/${normalized.length} species`);

  writeFileSync(IMAGE_CACHE, JSON.stringify(cache, null, 2));

  const file: NormalizedSeedFile = {
    version: SEED_FILE_VERSION,
    generatedAt: new Date().toISOString(),
    sourceQuery: `USDA PLANTS checklist, State Distribution ∈ {${NE_STATES.join(",")}}`,
    count: normalized.length,
    plants: normalized,
  };
  writeFileSync(OUT_JSON, JSON.stringify(file, null, 2));
  console.log(`[scrape] wrote ${OUT_JSON} (${normalized.length} species)`);
}

main().catch((err) => {
  console.error("[scrape] failed:", err);
  process.exitCode = 1;
});
