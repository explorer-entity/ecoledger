// Verification & Oracle Engine (Layer 2) skeleton.

export interface TlsNotaryProof {
  server: string;
  field: string;
  value: unknown;
  signature: string; // mock
}

export function generateTlsNotaryProof(server: string, field: string, value: unknown): TlsNotaryProof {
  // STUB: real implementation uses TLSNotary MPC-TLS.
  return { server, field, value, signature: `sig-${server}-${field}` };
}

export function verifyTlsNotaryProof(proof: TlsNotaryProof): boolean {
  return proof.signature === `sig-${proof.server}-${proof.field}`;
}

export interface ZkProof {
  circuit: string;
  publicSignals: string[];
  proof: string; // mock
}

export function generateZkThresholdProof(circuit: string, value: number, threshold: number): ZkProof {
  // STUB: real implementation uses Circom/SnarkJS.
  return { circuit, publicSignals: [String(threshold)], proof: `zk-${value >= threshold}` };
}

export function verifyZkProof(proof: ZkProof): boolean {
  return proof.proof.endsWith("true");
}

// Anti-fraud: perceptual hash dedup (stub).
const seenHashes = new Set<string>();
export function checkPhotoDedup(perceptualHash: string): boolean {
  if (seenHashes.has(perceptualHash)) return false;
  seenHashes.add(perceptualHash);
  return true;
}

export function checkGpsAttestation(isMockLocation: boolean): boolean {
  return !isMockLocation;
}

export interface VerificationResult {
  ok: boolean;
  reason?: string;
  nullifier: string;
}

export function verifyAction(input: {
  source: string;
  value: number;
  threshold: number;
  photoHash?: string;
  isMockLocation?: boolean;
}): VerificationResult {
  const tls = generateTlsNotaryProof(input.source, "value", input.value);
  if (!verifyTlsNotaryProof(tls)) return { ok: false, reason: "tlsnotary failed", nullifier: "" };

  const zk = generateZkThresholdProof("threshold", input.value, input.threshold);
  if (!verifyZkProof(zk)) return { ok: false, reason: "threshold not met", nullifier: "" };

  if (input.photoHash && !checkPhotoDedup(input.photoHash)) {
    return { ok: false, reason: "duplicate photo", nullifier: "" };
  }
  if (input.isMockLocation && !checkGpsAttestation(input.isMockLocation)) {
    return { ok: false, reason: "mock location", nullifier: "" };
  }

  const nullifier = `null-${input.source}-${input.value}-${input.threshold}`;
  return { ok: true, nullifier };
}
