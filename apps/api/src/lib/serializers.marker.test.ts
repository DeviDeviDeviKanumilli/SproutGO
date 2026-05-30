import { describe, it, expect } from "vitest";
import { serializeObservationMarker } from "./serializers";
import { snapToGrid } from "./geo";

// serializeObservationMarker enforces R3: rare-plant coordinate fuzzing happens
// server-side. Owners always see exact coords; non-owners of rare/sensitive plants
// get grid-snapped coords. The function is pure, so we feed it plain object literals
// shaped like the Prisma rows (Observation + included plant) — no DB/mock needed.

const OWNER = "user-owner";
const VIEWER = "user-viewer";
const LAT = 40.7128;
const LNG = -74.006;

// Minimal Plant row; only the fields the serializer reads matter, but include the
// rest so the literal is shaped like a real Prisma row.
function plant(overrides: Record<string, unknown> = {}) {
  return {
    id: "plant-1",
    scientificName: "Quercus rubra",
    commonName: "Northern Red Oak",
    family: "Fagaceae",
    genus: "Quercus",
    type: "TREE",
    description: null,
    habitat: null,
    nativeStatus: "NATIVE",
    rarity: "COMMON",
    imageUrl: "https://example.com/oak.jpg",
    source: "STUB",
    confidence: 0.9,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function observation(overrides: Record<string, unknown> = {}) {
  return {
    id: "obs-1",
    userId: OWNER,
    plantId: "plant-1",
    imagePath: "user-owner/obs/a.jpg",
    latitude: LAT,
    longitude: LNG,
    confidence: 0.9,
    idStatus: "MATCHED",
    privacy: "PUBLIC",
    pointsAwarded: 10,
    createdAt: new Date("2026-02-02T12:00:00.000Z"),
    ...overrides,
  };
}

describe("serializeObservationMarker", () => {
  it("owner of a RARE plant gets exact coords, isOwn=true, fuzzed=false", () => {
    const row = observation({ userId: OWNER, plant: plant({ rarity: "RARE" }) });
    const marker = serializeObservationMarker(row as never, OWNER);
    expect(marker.isOwn).toBe(true);
    expect(marker.fuzzed).toBe(false);
    expect(marker.latitude).toBe(LAT);
    expect(marker.longitude).toBe(LNG);
  });

  it("non-owner of a RARE plant gets fuzzed coords equal to snapToGrid(original)", () => {
    const row = observation({ userId: OWNER, plant: plant({ rarity: "RARE" }) });
    const marker = serializeObservationMarker(row as never, VIEWER);
    const snapped = snapToGrid(LAT, LNG);
    expect(marker.isOwn).toBe(false);
    expect(marker.fuzzed).toBe(true);
    expect(marker.latitude).toBe(snapped.latitude);
    expect(marker.longitude).toBe(snapped.longitude);
    // Sanity: fuzzing actually moved the point off the exact coordinate.
    expect(marker.latitude).not.toBe(LAT);
  });

  it("non-owner of a COMMON plant gets exact coords, fuzzed=false", () => {
    const row = observation({ userId: OWNER, plant: plant({ rarity: "COMMON" }) });
    const marker = serializeObservationMarker(row as never, VIEWER);
    expect(marker.isOwn).toBe(false);
    expect(marker.fuzzed).toBe(false);
    expect(marker.latitude).toBe(LAT);
    expect(marker.longitude).toBe(LNG);
  });

  it("non-owner uses the STORED public coords (not a re-snap of exact)", () => {
    // Sentinel public coords distinct from snapToGrid(exact) prove we read the stored
    // columns rather than recomputing — this is what closes the bbox-probe hole.
    const row = observation({
      userId: OWNER,
      plant: plant({ rarity: "RARE" }),
      publicLatitude: 1.23,
      publicLongitude: 4.56,
    });
    const marker = serializeObservationMarker(row as never, VIEWER);
    expect(marker.isOwn).toBe(false);
    expect(marker.fuzzed).toBe(true);
    expect(marker.latitude).toBe(1.23);
    expect(marker.longitude).toBe(4.56);
  });

  it("owner ignores public coords and still sees exact", () => {
    const row = observation({
      userId: OWNER,
      plant: plant({ rarity: "RARE" }),
      publicLatitude: 1.23,
      publicLongitude: 4.56,
    });
    const marker = serializeObservationMarker(row as never, OWNER);
    expect(marker.isOwn).toBe(true);
    expect(marker.fuzzed).toBe(false);
    expect(marker.latitude).toBe(LAT);
    expect(marker.longitude).toBe(LNG);
  });

  it("non-owner of a COMMON plant with public==exact coords is not marked fuzzed", () => {
    const row = observation({
      userId: OWNER,
      plant: plant({ rarity: "COMMON" }),
      publicLatitude: LAT,
      publicLongitude: LNG,
    });
    const marker = serializeObservationMarker(row as never, VIEWER);
    expect(marker.fuzzed).toBe(false);
    expect(marker.latitude).toBe(LAT);
    expect(marker.longitude).toBe(LNG);
  });

  it("embeds the right plant subset and mirrors plant.rarity", () => {
    const row = observation({ plant: plant({ rarity: "LEGENDARY" }) });
    const marker = serializeObservationMarker(row as never, OWNER);
    expect(marker.rarity).toBe("LEGENDARY");
    expect(marker.plant).toEqual({
      id: "plant-1",
      commonName: "Northern Red Oak",
      scientificName: "Quercus rubra",
      rarity: "LEGENDARY",
      imageUrl: "https://example.com/oak.jpg",
    });
    // createdAt is serialized to an ISO string.
    expect(marker.createdAt).toBe("2026-02-02T12:00:00.000Z");
  });
});
