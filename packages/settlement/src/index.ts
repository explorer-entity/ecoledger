// Mock UPI settlement engine: simulates instant INR payouts with idempotency.

export interface PayoutReceipt {
  txId: string;
  status: "SUCCESS" | "DUPLICATE";
  bankAccountId: string;
  amountPaise: number;
  timestamp: string;
}

export class MockUpiEngine {
  private seen = new Map<string, PayoutReceipt>();

  payout(bankAccountId: string, amountPaise: number, idempotencyKey: string): PayoutReceipt {
    const existing = this.seen.get(idempotencyKey);
    if (existing) {
      return { ...existing, status: "DUPLICATE" };
    }
    const receipt: PayoutReceipt = {
      txId: `UPI-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: "SUCCESS",
      bankAccountId,
      amountPaise,
      timestamp: new Date().toISOString(),
    };
    this.seen.set(idempotencyKey, receipt);
    return receipt;
  }

  // Simulate escrow release: 70% user share paid out.
  releaseToUser(bankAccountId: string, totalPaise: number, idempotencyKey: string): PayoutReceipt {
    const userShare = Math.floor(totalPaise * 0.7);
    return this.payout(bankAccountId, userShare, idempotencyKey);
  }
}

export const mockUpi = new MockUpiEngine();
