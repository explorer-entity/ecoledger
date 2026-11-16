export class MockUpiEngine {
  releaseToUser(bankAccountId: string, totalPaise: number, idempotencyKey: string): any;
  payout(bankAccountId: string, amountPaise: number, idempotencyKey: string): any;
}
export declare function handleEscrowRelease(engine: any, event: any): any;
export declare const mockUpi: MockUpiEngine;
