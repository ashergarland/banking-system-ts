import { expect } from 'chai';
import { BankingSystem } from '../src/bankingSystem';

describe('Stage 4 - Scheduled Transfers', () => {
  let bank: BankingSystem;

  beforeEach(() => {
    bank = new BankingSystem();
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 1000, 1000);
  });

  it('should schedule a transfer successfully', () => {
    const id = bank.scheduleTransfer(1000, 'alice', 'bob', 500, 5000, 1000);
    expect(id).to.be.a('string');
  });

  it('should return null for invalid scheduled transfer (unknown account)', () => {
    const id = bank.scheduleTransfer(1000, 'unknown', 'bob', 100, 5000, 1000);
    expect(id).to.be.null;
  });

  it('should return null for invalid amount or time', () => {
    expect(bank.scheduleTransfer(1000, 'alice', 'bob', 0, 5000, 1000)).to.be.null;
    expect(bank.scheduleTransfer(1000, 'alice', 'bob', 100, 0, 1000)).to.be.null;
    expect(bank.scheduleTransfer(1000, 'alice', 'bob', 100, 5000, -1)).to.be.null;
  });

  it('should process scheduled transfers at or after scheduled time', () => {
    const scheduledId = bank.scheduleTransfer(1000, 'alice', 'bob', 200, 3000, 2000);
    expect(scheduledId).to.be.a('string');

    const processedIds = bank.processScheduledTransfers(3000);
    expect(processedIds).to.have.lengthOf(1);

    const newTransferId = processedIds[0];

    // New transfer should be pending
    expect(bank.getTransferStatus(newTransferId, 4000)).to.equal('pending');
  });

  it('should ignore transfers scheduled for the future', () => {
    bank.scheduleTransfer(1000, 'alice', 'bob', 100, 6000, 1000);
    const processed = bank.processScheduledTransfers(5000);
    expect(processed).to.be.empty;
  });

  it('should reflect transfer in pending state after processing', () => {
    bank.scheduleTransfer(1000, 'alice', 'bob', 300, 2500, 2000);
    const processed = bank.processScheduledTransfers(2500);
    expect(bank.getTransferStatus(processed[0], 2600)).to.equal('pending');
  });

  it('should accept a scheduled transfer after processing', () => {
    const scheduledId = bank.scheduleTransfer(1000, 'alice', 'bob', 150, 2000, 1000);
    const processed = bank.processScheduledTransfers(2000);
    const transferId = processed[0];
    const accepted = bank.acceptTransfer(transferId, 2500);
    expect(accepted).to.be.true;
    expect(bank.getTransferStatus(transferId, 2500)).to.equal('accepted');
  });

  it('should expire a processed transfer that is not accepted in TTL', () => {
    const scheduledId = bank.scheduleTransfer(1000, 'alice', 'bob', 200, 2000, 1000);
    const processed = bank.processScheduledTransfers(2000);
    const transferId = processed[0];
    expect(bank.getTransferStatus(transferId, 3100)).to.equal('expired');
  });

  it('should skip processing if sender lacks funds at execution time', () => {
    bank.withdraw('alice', 900, 1100);
    const scheduledId = bank.scheduleTransfer(1200, 'alice', 'bob', 200, 3000, 1000);
    const result = bank.processScheduledTransfers(3000);
    expect(result).to.be.empty;
    // Scheduled transfer still exists but is marked rejected
    const ids = bank.getScheduledTransferIds(4000, 'alice');
    expect(ids).to.not.include(scheduledId);
  });

  it('should list scheduled transfer IDs for an account', () => {
    const id = bank.scheduleTransfer(1000, 'alice', 'bob', 100, 5000, 1000);
    const list = bank.getScheduledTransferIds(4000, 'alice');
    expect(list).to.include(id);
  });

  it('should return null for getScheduledTransferIds on unknown account', () => {
    expect(bank.getScheduledTransferIds(4000, 'ghost')).to.be.null;
  });

  it('should not reprocess the same scheduled transfer', () => {
    bank.scheduleTransfer(1000, 'alice', 'bob', 100, 3000, 1000);
    const first = bank.processScheduledTransfers(3000);
    const second = bank.processScheduledTransfers(3500);
    expect(second).to.be.empty;
  });

  it('should clean up discarded transfers that fail validation at runtime', () => {
    bank.withdraw('alice', 1000, 2000);
    const scheduledId = bank.scheduleTransfer(2500, 'alice', 'bob', 100, 3000, 1000);
    const processed = bank.processScheduledTransfers(3000);
    expect(processed).to.be.empty;
    expect(bank.getTransferStatus(scheduledId!, 4000)).to.be.null;
  });

  it('should handle multiple scheduled transfers in batch', () => {
    bank.scheduleTransfer(1000, 'alice', 'bob', 100, 3000, 1000);
    bank.scheduleTransfer(1000, 'alice', 'bob', 100, 3000, 1000);
    const processed = bank.processScheduledTransfers(3000);
    expect(processed.length).to.equal(2);
  });

  it('should not allow scheduling a transfer to self', () => {
    const id = bank.scheduleTransfer(1000, 'alice', 'alice', 100, 5000, 1000);
    expect(id).to.be.null;
  });

  it('should not include expired or rejected scheduled transfers in getScheduledTransferIds', () => {
    const id1 = bank.scheduleTransfer(1000, 'alice', 'bob', 100, 2000, 1000);
    bank.processScheduledTransfers(2000);
    const id2 = bank.scheduleTransfer(3000, 'alice', 'bob', 2000, 3500, 1000); // likely rejected
    bank.processScheduledTransfers(3500);

    const ids = bank.getScheduledTransferIds(4000, 'alice');
    expect(ids).to.not.include(id1);
    expect(ids).to.not.include(id2);
  });
});
