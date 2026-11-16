// Canonical shared types for EcoLedger.

export type BehaviorSource =
  | "energy"
  | "mobility"
  | "consumption"
  | "waste";

export interface BehaviorEvent {
  source: BehaviorSource;
  timestamp: string; // ISO-8601
  metric: string;
  value: number;
  unit: string;
  consentRef: string;
}

export interface ProofResult {
  circuit: string;
  publicSignals: string[];
  proof: unknown;
  nullifier: string;
}

export const REVENUE_SPLIT = {
  user: 0.7,
  nodeOperator: 0.15,
  treasury: 0.15,
} as const;
