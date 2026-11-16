// EcoLedger oracle node entrypoint.
import type { BehaviorEvent, ProofResult } from "@ecoledger/shared";
import { verifyAction } from "./verification.js";

export async function verify(event: BehaviorEvent): Promise<ProofResult> {
  const result = verifyAction({
    source: event.source,
    value: event.value,
    threshold: 0,
  });
  if (!result.ok) throw new Error(result.reason ?? "verification failed");
  return {
    circuit: "threshold",
    publicSignals: [String(event.value)],
    proof: { ok: true },
    nullifier: result.nullifier,
  };
}

export * from "./verification.js";

console.log("EcoLedger oracle node skeleton ready");
