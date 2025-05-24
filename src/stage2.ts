// Stage 2: Transaction Tracking and Metrics
// Overview:
// In this stage, you will extend the basic banking system to track detailed transaction records for each account.
// Deposits and withdrawals should now be preserved as discrete, timestamped events.
// You will implement methods that compute metrics and return insights based on those transactions.

// Requirements:
// - Each deposit and withdrawal must be recorded internally as a timestamped transaction.
// - Transactions must be stored in chronological order.
// - You will implement methods to:
//     - Compute the total transaction volume (sum of absolute values) for a given account.
//     - Retrieve the top N accounts by transaction volume at a point in time.
//     - Return a stringified transaction history for a specific account.
// - Transaction volume includes deposits and withdrawals (e.g., deposit 500 + withdrawal 500 = volume 1000).
// - In Stage 3, completed transfers will also contribute to transaction volume.

import { Stage1 } from './stage1';

export interface Stage2 extends Stage1 {
  /**
   * Computes the total transaction volume for the given account up to and including the specified timestamp.
   * Volume is calculated as the sum of all deposit and withdrawal amounts (all counted positively).
   * Future stages will include transfer volume as well.
   *
   * @param accountId - The ID of the account to query.
   * @param timestamp - The cutoff time (inclusive); only transactions at or before this time are counted.
   * @returns The total volume as a non-negative integer, or null if the account does not exist.
   */
  getTransactionVolume(accountId: string, timestamp: number): number | null;

  /**
   * Returns the top N account IDs ranked by their total transaction volume at a specific point in time.
   * If multiple accounts share the same volume, ties are broken alphabetically by account ID (ascending).
   *
   * @param n - The maximum number of account IDs to return. If n exceeds the number of known accounts, return all of them.
   * @param timestamp - The cutoff time (inclusive); only transactions at or before this time are considered.
   * @returns An array of account IDs, sorted by transaction volume (descending), with alphabetical tie-breaking (ascending).
   *          Returns an empty array if there are no accounts in the system.
   */
  getTopAccountsByTransactionVolume(n: number, timestamp: number): string[];

  /**
   * Returns a formatted, chronological list of transactions for the given account up to and including the specified timestamp.
   * Each transaction should be represented as a string in the format: "<type> <amount> <timestamp>"
   * Where <type> is either "deposit" or "withdrawal".
   *
   * @param accountId - The ID of the account to query.
   * @param timestamp - The cutoff time (inclusive); only transactions at or before this time are returned.
   * @returns An array of stringified transactions in ascending timestamp order, or null if the account does not exist.
   */
  getTransactionHistory(accountId: string, timestamp: number): string[] | null;
}
