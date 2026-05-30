// Library seed entry point.
// M0 placeholder — the full USDA → Plant + Wikimedia image pipeline is built in M1
// (see currentPlans/LIBRARY_SEED.md). This keeps `npm run db:seed` wired and the
// script reproducible. The real implementation:
//   1. Load USDA CSV → parse rows.        4. Resolve one Wikimedia image+license/species.
//   2. Filter to region species list.     5. Assign rarity via heuristic.
//   3. Normalize names; collapse synonyms. 6. prisma.plant.createMany({ skipDuplicates }).

import { prisma } from "../src/index";

async function main(): Promise<void> {
  console.log("[seed] M0 placeholder — no Library data inserted yet.");
  console.log("[seed] Implement the USDA/Wikimedia pipeline in M1 (LIBRARY_SEED.md).");
  // Smoke-check connectivity without writing rows.
  const count = await prisma.plant.count();
  console.log(`[seed] Library currently has ${count} plant(s).`);
}

main()
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
