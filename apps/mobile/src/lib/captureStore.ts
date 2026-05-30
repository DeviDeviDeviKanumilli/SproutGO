// Ephemeral hand-off store for the capture→processing→result flow. expo-router params
// only carry strings cleanly, and the captured photo URI + the ObservationResult are
// richer than that — so we stash them here for the next screen to pick up. This is
// session-only scratch state, intentionally NOT global app state.

import type { ObservationResult } from "@sproutgo/shared";

let pendingPhotoUri: string | null = null;
let lastResult: ObservationResult | null = null;

export function setPendingPhoto(uri: string): void {
  pendingPhotoUri = uri;
}

export function takePendingPhoto(): string | null {
  const uri = pendingPhotoUri;
  pendingPhotoUri = null;
  return uri;
}

export function setLastResult(result: ObservationResult): void {
  lastResult = result;
}

export function takeLastResult(): ObservationResult | null {
  const result = lastResult;
  lastResult = null;
  return result;
}
