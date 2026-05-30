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
