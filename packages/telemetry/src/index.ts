// Telemetry ingestion (Layer 1) skeleton.

import type { BehaviorEvent } from "@ecoledger/shared";

export type MccBucket = "green" | "neutral" | "red";

// Minimal MCC classifier (expand with real MCC table).
export function classifyMcc(mcc: number): MccBucket {
  // Organic/grocery-ish MCCs -> green; fuel -> red.
  if (mcc === 5411 || mcc === 5499) return "green";
  if (mcc === 5541 || mcc === 5542) return "red";
  return "neutral";
}

export interface AaConsent {
  consentId: string;
  fiuId: string;
  scopes: string[];
  expiresAt: string;
}

// Mock AA consent artefact creation.
export function createConsent(fiuId: string, scopes: string[]): AaConsent {
  return {
    consentId: `consent-${Date.now()}`,
    fiuId,
    scopes,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function normalizeEvent(raw: {
  source: BehaviorEvent["source"];
  timestamp: string;
  metric: string;
  value: number;
  unit: string;
  consentRef: string;
}): BehaviorEvent {
  return raw;
}
