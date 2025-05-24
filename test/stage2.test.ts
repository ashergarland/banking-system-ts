// stage2.test.ts
import { expect } from 'chai';
import { BankingSystem } from '../src/bankingSystem';

describe('Stage 2 - Transaction Tracking and Metrics', () => {
  let bank: BankingSystem;
  const now = Date.now();

  beforeEach(() => {
    bank = new BankingSystem();
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.createAccount('carol');

    bank.deposit('alice', 100, now - 3000);
    bank.deposit('alice', 200, now - 2000);
    bank.withdraw('alice', 50, now - 1000);

    bank.deposit('bob', 300, now - 4000);
    bank.withdraw('bob', 150, now - 2000);

    bank.deposit('carol', 50, now - 1500);
  });

  it('should return correct transaction volume for an account', () => {
    expect(bank.getTransactionVolume('alice', now)).to.equal(350);
    expect(bank.getTransactionVolume('bob', now)).to.equal(450);
    expect(bank.getTransactionVolume('carol', now)).to.equal(50);
  });

  it('should return correct volume when queried before any transactions', () => {
    expect(bank.getTransactionVolume('alice', now - 5000)).to.equal(0);
  });

  it('should return null for unknown accounts when getting volume', () => {
    expect(bank.getTransactionVolume('unknown', now)).to.be.null;
  });

  it('should return correct top accounts by transaction volume', () => {
    const top2 = bank.getTopAccountsByTransactionVolume(2, now);
    expect(top2).to.deep.equal(['bob', 'alice']);
  });

  it('should break ties by account ID alphabetically', () => {
    bank.deposit('carol', 400, now);
    // Now carol = 450, ties with bob
    const top3 = bank.getTopAccountsByTransactionVolume(3, now);
    expect(top3).to.deep.equal(['bob', 'carol', 'alice']);
  });

  it('should return all accounts if N is greater than available accounts', () => {
    const all = bank.getTopAccountsByTransactionVolume(10, now);
    expect(all).to.have.members(['alice', 'bob', 'carol']);
  });

  it('should return empty array if no accounts exist', () => {
    bank = new BankingSystem();
    expect(bank.getTopAccountsByTransactionVolume(5, now)).to.deep.equal([]);
  });

  it('should return correct transaction history ordered by timestamp', () => {
    const history = bank.getTransactionHistory('alice', now);
    expect(history).to.deep.equal([
      `deposit 100 ${now - 3000}`,
      `deposit 200 ${now - 2000}`,
      `withdrawal 50 ${now - 1000}`
    ]);
  });

  it('should return filtered transaction history by timestamp cutoff', () => {
    const history = bank.getTransactionHistory('alice', now - 1500);
    expect(history).to.deep.equal([
      `deposit 100 ${now - 3000}`,
      `deposit 200 ${now - 2000}`
    ]);
  });

  it('should return empty history if no transactions exist yet', () => {
    bank.createAccount('dave');
    expect(bank.getTransactionHistory('dave', now)).to.deep.equal([]);
  });

  it('should return null history for unknown account', () => {
    expect(bank.getTransactionHistory('unknown', now)).to.be.null;
  });
});
