import test from "node:test";
import assert from "node:assert/strict";
import {
  generateTlsNotaryProof,
  verifyTlsNotaryProof,
  generateZkThresholdProof,
  verifyZkProof,
  checkPhotoDedup,
  resetPhotoDedup,
  checkGpsAttestation,
  verifyAction,
} from "../src/verification.ts";

const SECRET = "test-secret";

test("TLSNotary proof verifies with correct secret", () => {
  const proof = generateTlsNotaryProof("bescom", "kwh", 120, SECRET);
  assert.equal(verifyTlsNotaryProof(proof, SECRET), true);
  assert.equal(verifyTlsNotaryProof(proof, "wrong"), false);
});

test("TLSNotary proof fails on tampered value", () => {
  const proof = generateTlsNotaryProof("bescom", "kwh", 120, SECRET);
  proof.value = 999;
  assert.equal(verifyTlsNotaryProof(proof, SECRET), false);
});

test("zk threshold proof verifies and encodes result", () => {
  const proof = generateZkThresholdProof("threshold", 10, 5, SECRET);
  assert.equal(verifyZkProof(proof, SECRET), true);
  assert.equal(proof.publicSignals[1], "1");

  const fail = generateZkThresholdProof("threshold", 3, 5, SECRET);
  assert.equal(fail.publicSignals[1], "0");
  assert.equal(verifyZkProof(fail, SECRET), true); // proof integrity holds, result flag 0
});

test("zk proof fails with wrong secret", () => {
  const proof = generateZkThresholdProof("threshold", 10, 5, SECRET);
  assert.equal(verifyZkProof(proof, "wrong"), false);
});

test("photo dedup rejects duplicate hash", () => {
  resetPhotoDedup();
  assert.equal(checkPhotoDedup("hash-1"), true);
  assert.equal(checkPhotoDedup("hash-1"), false);
  assert.equal(checkPhotoDedup("hash-2"), true);
});

test("gps attestation rejects mock location", () => {
  assert.equal(checkGpsAttestation(true), false);
  assert.equal(checkGpsAttestation(false), true);
});

test("verifyAction succeeds for valid input", () => {
  resetPhotoDedup();
  const r = verifyAction({ source: "energy", value: 10, threshold: 5, photoHash: "h1", isMockLocation: false, secret: SECRET });
  assert.equal(r.ok, true);
  assert.ok(r.nullifier.length > 0);
});

test("verifyAction fails threshold not met", () => {
  resetPhotoDedup();
  const r = verifyAction({ source: "energy", value: 3, threshold: 5, secret: SECRET });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "threshold not met");
});

test("verifyAction fails duplicate photo", () => {
  resetPhotoDedup();
  verifyAction({ source: "energy", value: 10, threshold: 5, photoHash: "dup", secret: SECRET });
  const r = verifyAction({ source: "energy", value: 10, threshold: 5, photoHash: "dup", secret: SECRET });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "duplicate photo");
});

test("verifyAction fails mock location", () => {
  resetPhotoDedup();
  const r = verifyAction({ source: "energy", value: 10, threshold: 5, isMockLocation: true, secret: SECRET });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "mock location");
});
