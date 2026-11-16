import test from "node:test";
import assert from "node:assert/strict";
import { MockUpiEngine, handleEscrowRelease, type EscrowReleaseEvent } from "../src/index.ts";

const event: EscrowReleaseEvent = {
  txHash: "0xabc",
  logIndex: 0,
  user: "0xuser",
  bankAccountId: "bank-1",
  amount: 100000,
};

test("escrow release triggers a single UPI payout (idempotent on replay)", () => {
  const engine = new MockUpiEngine();
  const first = handleEscrowRelease(engine, event);
  const second = handleEscrowRelease(engine, event); // replayed event

  assert.equal(first.status, "SUCCESS");
  assert.equal(second.status, "DUPLICATE");
  assert.equal(first.txId, second.txId);
  // 70% user share
  assert.equal(first.amountPaise, 70000);
});
