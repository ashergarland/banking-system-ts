// stage3.test.ts
import { expect } from 'chai';
import { BankingSystem } from '../src/bankingSystem';

describe('Stage 3 - Inter-Account Transfers (Pending / Accept / Expire)', () => {
  let bank: BankingSystem;

  beforeEach(() => {
    bank = new BankingSystem();
  });

  it('should create a valid transfer between two accounts', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 50, 2000, 1000);
    expect(transferId).to.be.a('string');
  });

  it('should return null if sender does not exist', () => {
    bank.createAccount('bob');
    const transferId = bank.createTransfer('unknown', 'bob', 50, 1000, 1000);
    expect(transferId).to.be.null;
  });

  it('should return null if recipient does not exist', () => {
    bank.createAccount('alice');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'unknown', 50, 1000, 1000);
    expect(transferId).to.be.null;
  });

  it('should return null if amount is invalid', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 0, 1000, 1000);
    expect(transferId).to.be.null;
  });

  it('should return null if sender has insufficient funds', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 10, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 50, 1000, 1000);
    expect(transferId).to.be.null;
  });

  it('should return null if sender and recipient are the same', () => {
    bank.createAccount('alice');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'alice', 50, 1000, 1000);
    expect(transferId).to.be.null;
  });

  it('should mark transfer as pending immediately after creation', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 50, 2000, 5000);
    expect(bank.getTransferStatus(transferId!, 2000)).to.equal('pending');
  });

  it('should mark transfer as accepted when accepted within TTL', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 50, 2000, 5000);
    const accepted = bank.acceptTransfer(transferId!, 6000);
    expect(accepted).to.be.true;
    expect(bank.getTransferStatus(transferId!, 6000)).to.equal('accepted');
  });

  it('should deposit into recipient balance when accepted', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 50, 2000, 5000);
    bank.acceptTransfer(transferId!, 6000);
    expect(bank.getBalance('bob', 6000)).to.equal(50);
  });

  it('should mark transfer as expired if TTL elapsed', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 50, 2000, 1000);
    expect(bank.getTransferStatus(transferId!, 4000)).to.equal('expired');
  });

  it('should refund sender on expired transfer', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 50, 2000, 1000);
    expect(bank.getBalance('alice', 2500)).to.equal(50);
    expect(bank.getTransferStatus(transferId!, 4000)).to.equal('expired');
    expect(bank.getBalance('alice', 4000)).to.equal(100);
  });

  it('should not accept expired transfers', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 50, 2000, 1000);
    const accepted = bank.acceptTransfer(transferId!, 4000);
    expect(accepted).to.be.false;
  });

  it('should not allow accepting the same transfer twice', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 50, 2000, 5000);
    bank.acceptTransfer(transferId!, 3000);
    const secondAttempt = bank.acceptTransfer(transferId!, 4000);
    expect(secondAttempt).to.be.false;
  });

  it('should hold funds during pending transfer', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 70, 2000, 5000);
    expect(bank.getBalance('alice', 2000)).to.equal(30);
  });

  it('should count only accepted transfers plus deposits and withdrawals toward transaction volume', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 200, 1000);
    bank.withdraw('alice', 50, 1500);

    const transferId1 = bank.createTransfer('alice', 'bob', 50, 2000, 5000);
    const transferId2 = bank.createTransfer('alice', 'bob', 50, 3000, 1000);

    expect(transferId1).to.not.be.null;
    expect(transferId2).to.not.be.null;

    bank.acceptTransfer(transferId1!, 6000);

    expect(bank.getTransactionVolume('alice', 7000)).to.equal(300); // 200 deposit + 50 withdrawal + 50 transfer
    expect(bank.getTransactionVolume('bob', 7000)).to.equal(50);   // only accepted transfer in
  });

  it('should reflect correct balances after accepted and pending transfers', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 300, 1000);
    const transferId1 = bank.createTransfer('alice', 'bob', 100, 2000, 5000);
    const transferId2 = bank.createTransfer('alice', 'bob', 50, 2500, 5000);
    bank.acceptTransfer(transferId1!, 4000);
    expect(bank.getBalance('alice', 2600)).to.equal(150);
    expect(bank.getBalance('bob', 2600)).to.equal(100);
  });

  it('should correctly create accounts and prevent duplicates', () => {
    expect(bank.createAccount('alice')).to.be.true;
    expect(bank.createAccount('alice')).to.be.false; // duplicate
  });
  
  it('should deposit and withdraw funds with proper validation', () => {
    bank.createAccount('alice');
    expect(bank.deposit('alice', 100, 1000)).to.be.true;
    expect(bank.withdraw('alice', 50, 2000)).to.be.true;
    expect(bank.getBalance('alice', 3000)).to.equal(50);
  });
  
  it('should fail to deposit or withdraw with invalid inputs', () => {
    bank.createAccount('alice');
    expect(bank.deposit('alice', 0, 1000)).to.be.false;
    expect(bank.withdraw('alice', -20, 1000)).to.be.false;
    expect(bank.withdraw('alice', 1000, 1000)).to.be.false; // insufficient
    expect(bank.deposit('bob', 50, 1000)).to.be.false; // nonexistent account
  });
  
  it('should correctly calculate transaction volume with deposits and withdrawals', () => {
    bank.createAccount('alice');
    bank.deposit('alice', 100, 1000);
    bank.withdraw('alice', 30, 2000);
    expect(bank.getTransactionVolume('alice', 3000)).to.equal(130); // 100 + 30
  });
  
  it('should include accepted transfers in volume calculation', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 200, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 50, 2000, 5000);
    bank.acceptTransfer(transferId!, 4000);
  
    expect(bank.getTransactionVolume('alice', 5000)).to.equal(250); // deposit + accepted transfer out
    expect(bank.getTransactionVolume('bob', 5000)).to.equal(50);    // accepted transfer in
  });
  
  it('should exclude expired transfers from volume calculation', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 200, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 50, 2000, 500); // expires at 2500
    expect(bank.getTransactionVolume('alice', 3000)).to.equal(200); // only deposit counts
    expect(bank.getTransactionVolume('bob', 3000)).to.equal(0);
  });
  
  it('should return transaction history including deposits and withdrawals', () => {
    bank.createAccount('alice');
    bank.deposit('alice', 100, 1000);
    bank.withdraw('alice', 30, 1500);
    expect(bank.getTransactionHistory('alice', 2000)).to.deep.equal([
      'deposit 100 1000',
      'withdrawal 30 1500',
    ]);
  });
  
  it('should include transfers in transaction history with type transfer', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 50, 1500, 5000);
    bank.acceptTransfer(transferId!, 2000);
  
    const history = bank.getTransactionHistory('alice', 3000);
    expect(history).to.include('transfer 50 1500');
  });

  it('should maintain chronological order in transaction history with mixed types', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 300, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 100, 1100, 5000);
    expect(transferId).to.not.be.null;
    expect(bank.acceptTransfer(transferId!, 1400)).to.be.true;
    bank.withdraw('alice', 50, 1200);
  
    const history = bank.getTransactionHistory('alice', 2000);
    expect(history).to.deep.equal([
      'deposit 300 1000',
      'transfer 100 1100',
      'withdrawal 50 1200',
    ]);
  });  

  it('should include only deposits, withdrawals, and accepted transfers in transaction history', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');

    bank.deposit('alice', 100, 1000); // included
    bank.withdraw('alice', 30, 1500); // included

    const acceptedTransferId = bank.createTransfer('alice', 'bob', 20, 2000, 5000);
    bank.acceptTransfer(acceptedTransferId!, 3000); // included

    const pendingTransferId = bank.createTransfer('alice', 'bob', 10, 4000, 10000); // still pending at 4500
    const expiredTransferId = bank.createTransfer('alice', 'bob', 10, 5000, 500);   // will expire before 6000
    
    expect(pendingTransferId).to.not.be.null;
    expect(expiredTransferId).to.not.be.null;

    const historyAt4500 = bank.getTransactionHistory('alice', 4500);
    const historyAt6000 = bank.getTransactionHistory('alice', 6000);

    // Only deposit, withdrawal, and accepted transfer should appear
    expect(historyAt4500).to.deep.equal([
      'deposit 100 1000',
      'withdrawal 30 1500',
      'transfer 20 2000'
    ]);

    // Expired transfer should not be included at 6000 either
    expect(historyAt6000).to.deep.equal([
      'deposit 100 1000',
      'withdrawal 30 1500',
      'transfer 20 2000'
    ]);
  });

  it('should exclude pending transfers from transaction history', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 200, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 100, 2000, 5000); // not yet accepted
  
    const history = bank.getTransactionHistory('alice', 2500);
    expect(history).to.deep.equal([
      'deposit 200 1000',
    ]);
  });
  
  it('should exclude expired transfers from transaction history', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 200, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 100, 2000, 1000); // expires at 3000
  
    // wait until after expiry
    const history = bank.getTransactionHistory('alice', 4000);
    expect(history).to.deep.equal([
      'deposit 200 1000',
    ]);
  });
  
  it('should return null for transfer with negative amount', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', -50, 2000, 1000);
    expect(transferId).to.be.null;
  });

  it('should return false for accepting a non-existent transfer ID', () => {
    expect(bank.acceptTransfer('nonexistent-id', 5000)).to.be.false;
  });
  
  it('should allow a transfer from a valid account even with zero balance if amount is validly deposited first', () => {
    bank.createAccount('alice');
    bank.createAccount('bob');
    bank.deposit('alice', 100, 1000);
    const transferId = bank.createTransfer('alice', 'bob', 100, 2000, 5000);
    expect(transferId).to.not.be.null;
  });
  
  it('should return null transfer status for unknown transfer ID', () => {
    expect(bank.getTransferStatus('fake-id', 5000)).to.be.null;
  });  
});
