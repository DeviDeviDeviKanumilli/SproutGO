// Shared API payload types used by both apps/mobile and apps/api.
// These mirror the API_CONTRACT.md response shapes. Enums come from ./enums.

import type {
  IdStatus,
  NativeStatus,
  PlantType,
  Privacy,
  Rarity,
  IdSource,
  FriendStatus,
} from "./enums";

// --- AI identification (AI_INTEGRATION.md) ---------------------------------
export interface IdResult {
  scientificName: string;
  commonName: string | null;
  family: string | null;
  confidence: number; // 0..1
}

// --- Core entities (subset of DATA_MODEL.md, serialized for the wire) ------
export interface Profile {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  totalPoints: number;
  isAdmin: boolean;
  createdAt: string; // ISO 8601
}

export interface ProfileStats {
  speciesDiscovered: number;
  photosSubmitted: number;
  rareFound: number;
  totalPoints: number;
  completionPct: number;
}

export interface ProfileWithStats extends Profile {
  stats: ProfileStats;
}

export interface Plant {
  id: string;
  scientificName: string;
  commonName: string | null;
  family: string | null;
  genus: string | null;
  type: PlantType;
  description: string | null;
  habitat: string | null;
  nativeStatus: NativeStatus;
  rarity: Rarity;
  imageUrl: string | null;
  // Attribution for seeded Commons images (CC licensing); null for AI-created/image-less rows.
  imageLicense: string | null;
  imageAttribution: string | null;
  imageSourceUrl: string | null;
  source: IdSource;
  confidence: number | null;
  createdAt: string;
}

export interface Observation {
  id: string;
  userId: string;
  plantId: string | null;
  imagePath: string;
  latitude: number | null;
  longitude: number | null;
  confidence: number | null;
  idStatus: IdStatus;
  privacy: Privacy;
  pointsAwarded: number;
  createdAt: string;
}

// Payload the Identification Result screen renders (API_CONTRACT §observations).
export interface ObservationResult {
  observation: Observation;
  plant: Plant | null;
  confidence: number | null;
  isFirstDiscovery: boolean;
  pointsAwarded: number;
  idStatus: IdStatus;
  quotaReached?: boolean;
}

// A discovery pin on the exploration map (GET /observations?bbox=). Lean by design —
// only what a marker + its preview sheet need. Coordinates are already privacy-fuzzed
// server-side for non-owners of rare/sensitive plants (SECURITY_AND_PRIVACY §location).
export interface ObservationMarker {
  id: string;
  plantId: string | null;
  latitude: number; // fuzzed (snapped to grid) for non-owners when `fuzzed` is true
  longitude: number;
  rarity: Rarity | null; // null when UNCERTAIN / no plant linked
  isOwn: boolean; // viewer is the owner — sees exact coords
  fuzzed: boolean; // coords were snapped for rare-plant privacy
  plant: {
    id: string;
    commonName: string | null;
    scientificName: string;
    rarity: Rarity;
    imageUrl: string | null;
  } | null;
  createdAt: string; // ISO 8601
}

// GET /observations?bbox= response (API_CONTRACT §observations).
export interface ObservationsMapResponse {
  markers: ObservationMarker[];
}

// A discovered-species entry in a user's PlantDex (DATA_MODEL §PlantDexEntry).
export interface PlantDexEntry {
  id: string;
  plantId: string;
  firstDiscoveredAt: string; // ISO 8601
  timesObserved: number;
  plant: Plant;
}

// A lean catalog entry — every Library species, used to render locked/discovered states in
// the PlantDex grid (design §8.9) without fetching the full Plant for each.
export interface CatalogPlant {
  id: string;
  commonName: string | null;
  scientificName: string;
  rarity: Rarity;
  imageUrl: string | null;
}

// GET /plantdex/me response (API_CONTRACT §plantdex). `catalog` is the full Library so the
// grid can show locked silhouettes for undiscovered species in one fetch.
export interface PlantDexResponse {
  entries: PlantDexEntry[];
  stats: ProfileStats;
  catalog: CatalogPlant[];
}

// GET /library response (API_CONTRACT §plantdex/library). Offset-paginated.
export interface LibraryResponse {
  plants: Plant[];
  total: number;
  limit: number;
  offset: number;
}

// GET /library/:plantId response — the Plant Detail screen (design §8.11). Community photos
// and map sightings are observation markers (rare-plant coords already server-fuzzed).
export interface PlantDetailResponse {
  plant: Plant;
  communityPhotos: ObservationMarker[];
  sightings: ObservationMarker[];
}

// --- Request bodies --------------------------------------------------------
export interface CreateProfileBody {
  username: string;
  avatarUrl?: string;
  bio?: string;
}

export interface UpdateProfileBody {
  username?: string;
  avatarUrl?: string;
  bio?: string;
}

// --- Standard error envelope (API_CONTRACT §conventions) -------------------
export interface ApiError {
  error: { code: string; message: string };
}

// --- Friend types (used from M4; defined here as the single source) --------
export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendStatus;
  createdAt: string;
  respondedAt: string | null;
}
