// Stage 3: Inter-Account Transfers (Pending / Accept / Expire)
// Overview:
// In this stage, you will extend the banking system to support inter-account transfers with delayed finalization.
// Transfers begin in a "pending" state and must be explicitly accepted by the recipient.
// A pending transfer expires if not accepted within a specified time-to-live (TTL) window.
//
// When a transfer is initiated, the specified amount is immediately withdrawn from the sender's balance.
// If the transfer is accepted, the funds are deposited into the recipient's account.
// If the transfer expires, the amount is refunded to the sender automatically.
//
// Requirements:
// - Transfers are initiated with a sender, recipient, amount, timestamp, and TTL (in milliseconds).
// - The amount is immediately withdrawn from the sender.
// - Transfers must be explicitly accepted by the recipient.
// - If not accepted before the TTL expires, the transfer is marked as expired and refunded.
// - Expired or rejected transfers are not counted toward transaction volume or history.
// - Accepted transfers are recorded as transactions for both accounts and included in volume/history (see Stage 2).
//
// Notes:
// - Transfers are immutable once created.
// - Transfer history is not exposed in this stage — only status is visible.
// - Transfers do not allow partial acceptance or cancellation.

import { Stage2 } from './stage2';

export interface Stage3 extends Stage2 {
  /**
   * Initiates a transfer from one account to another.
   * The amount is immediately withdrawn from the sender’s balance at the given timestamp.
   * The transfer enters a "pending" state until accepted or expired.
   *
   * @param fromAccountId - The ID of the sending account.
   * @param toAccountId - The ID of the receiving account.
   * @param amount - A positive integer amount to transfer.
   * @param timestamp - The time the transfer is created.
   * @param timeToLiveMs - The time window (in milliseconds) before the transfer expires.
   * @returns A unique transfer ID string if created successfully, or null if validation fails.
   *          Fails if either account does not exist, amount is invalid, or sender has insufficient funds.
   */
  createTransfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    timestamp: number,
    timeToLiveMs: number
  ): string | null;

  /**
   * Accepts a pending transfer and finalizes it.
   * The transfer must still be valid (not expired).
   * The amount is deposited into the recipient's balance at the original creation timestamp.
   *
   * @param transferId - The unique ID of the pending transfer.
   * @param timestamp - The current time (used to verify TTL).
   * @returns true if the transfer is accepted successfully, or false if the transfer is unknown, expired, or already accepted.
   */
  acceptTransfer(transferId: string, timestamp: number): boolean;

  /**
   * Returns the current status of the transfer.
   * Possible values are:
   * - "pending": the transfer exists and has not yet been accepted or expired.
   * - "accepted": the transfer has been finalized and funds delivered.
   * - "expired": the transfer TTL elapsed before acceptance and the funds were refunded to the sender.
   *
   * @param transferId - The unique ID of the transfer.
   * @param timestamp - The current time (used to determine expiry).
   * @returns A string status ("pending" | "accepted" | "expired"), or null if the transfer ID is unknown.
   */
  getTransferStatus(transferId: string, timestamp: number): "pending" | "accepted" | "expired" | null;
}
