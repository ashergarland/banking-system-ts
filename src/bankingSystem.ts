// bankingSystem.ts
// This is the main class you will implement step-by-step through each stage.
// Begin by implementing Stage1 interface.

import { Stage1 } from './stage1';
import { Stage2 } from './stage2';
import { Stage3 } from './stage3';
import { Stage4 } from './stage4';
import { ITransaction, Scheduled, Transaction, Transfer } from './transaction';

export class BankingSystem implements Stage4 {
    
    private readonly accounts: Record<string, ITransaction[]>;

    constructor() {
        this.accounts = {};
    }

    private exists(accountId: string): boolean {
        return accountId in this.accounts;
    }
    private getAllTransactions(timestamp: number): ITransaction[] {
        return Object.values(this.accounts)
            .flat()
            .filter(t => t.timestamp <= timestamp);
    }
    private getAccountTransactions(timestamp: number, accountId: string): ITransaction[] | null {
        if (!this.exists(accountId)) {
            return null;
        }

        return this.accounts[accountId]
            .filter(t => t.timestamp <= timestamp)
            .sort((a, b) => a.timestamp - b.timestamp);
    }
    private getAllAccounts(): string[] {
        return Object.keys(this.accounts);
    }

    // Stage 1

    createAccount(accountId: string): boolean {
        if (this.exists(accountId)) { // duplicate account
            return false;
        }

        this.accounts[accountId] = [];
        return true;
    }
    deposit(accountId: string, amount: number, timestamp: number): boolean {
        if (!this.exists(accountId)) { // invalid account
            return false;
        }

        if (amount <= 0) { // invalid amount
            return false;
        }

        const transaction = new Transaction(timestamp, amount, "deposit", accountId);
        this.accounts[accountId].push(transaction);
        return true;
    }
    withdraw(accountId: string, amount: number, timestamp: number): boolean {
        if (!this.exists(accountId)) { // invalid account
            return false;
        }

        if (amount <= 0) { // invalid amount
            return false;
        }

        if (this.getBalance(accountId, timestamp)! < amount) { // insufficient funds
            return false;
        }

        const transaction = new Transaction(timestamp, amount, "withdrawal", accountId);
        this.accounts[accountId].push(transaction);
        return true;
    }
    getBalance(accountId: string, timestamp: number): number | null {
        const transactions = this.getAccountTransactions(timestamp, accountId);
        if (!transactions) {
            return null;
        }

        return transactions.reduce((acc, tx) => {
            switch (tx.transactionType) {
                case "deposit":
                    return acc + tx.amount;
                case "withdrawal":
                    return acc - tx.amount;
                case "transfer": {
                    const status = tx.status(timestamp);
                    if (status === "accepted" && tx.recipient === accountId) {
                        return acc + tx.amount;
                    } else if ((status === "accepted" || status === "pending") && tx.sender === accountId) {
                        return acc - tx.amount;
                    }
                    return acc;
                }
                default:
                    return acc;
            }
        }, 0);
    }

    // Stage 2

    getTransactionVolume(accountId: string, timestamp: number): number | null {
        const transactions = this.getAccountTransactions(timestamp, accountId);
        if (!transactions) {
            return null;
        }

        return transactions.reduce((acc, tx) => {
            if (tx.status(timestamp) === "accepted" && tx.transactionType !== "scheduled") {
                return acc + tx.amount;
            }
            return acc;
        }, 0)
    }
    getTopAccountsByTransactionVolume(n: number, timestamp: number): string[] {
        if (n < 0) {
            return [];
        }

        return this.getAllAccounts()
            .map(accountId => ({
                accountId,
                volume: this.getTransactionVolume(accountId, timestamp) ?? 0
            }))
            .sort((a, b) =>
                b.volume !== a.volume
                    ? b.volume - a.volume
                    : a.accountId.localeCompare(b.accountId)
            )
            .slice(0, n)
            .map(({ accountId }) => accountId);
    }
    getTransactionHistory(accountId: string, timestamp: number): string[] | null {
        var transactions = this.getAccountTransactions(timestamp, accountId);
        if (!transactions) {
            return null;
        }

        return transactions
            .filter((a) => a.status(timestamp) === "accepted" && a.transactionType !== "scheduled") 
            .map((a) => {
                return `${a.transactionType} ${a.amount} ${a.timestamp}`
            });
    }

    // Stage 3

    createTransfer(fromAccountId: string, toAccountId: string, amount: number, timestamp: number, timeToLiveMs: number): string | null {
        if (!this.exists(fromAccountId)) { // invalid sender
            return null;
        }

        if (!this.exists(toAccountId)) { // invalid recipiant
            return null;
        }
        
        if (fromAccountId === toAccountId) { // invalid sender cannot equal recipiant
            return null;
        }   

        if (amount <= 0) { // invalid amount
            return null;
        }

        if (timeToLiveMs <= 0) { // invalid timeToLiveMs
            return null;
        }

        if (this.getBalance(fromAccountId, timestamp)! < amount) { // insufficient funds
            return null;
        }

        var transfer = new Transfer(timestamp, amount, fromAccountId, toAccountId, timeToLiveMs);
        this.accounts[fromAccountId].push(transfer);
        this.accounts[toAccountId].push(transfer);
        return transfer.id();
    }
    acceptTransfer(transferId: string, timestamp: number): boolean {
        var transfer = this.getAllTransactions(timestamp)
            .find((transfer) => transfer.transactionType === "transfer" && transfer.id() === transferId);

        return transfer ? transfer.accept(timestamp) : false;
    }
    getTransferStatus(transferId: string, timestamp: number): 'pending' | 'accepted' | 'expired' | null {
        var transfer = this.getAllTransactions(timestamp)
            .find((transfer) => transfer.transactionType === "transfer" && transfer.id() === transferId);
        
        return transfer ? (transfer as Transfer).status(timestamp) : null;
    }

    // Stage 4
    
    scheduleTransfer(timestamp: number, fromAccountId: string, toAccountId: string, amount: number, scheduledFor: number, timeToLiveMs: number): string | null {
        if (!this.exists(fromAccountId)) { // invalid sender
            return null;
        }

        if (!this.exists(toAccountId)) { // invalid recipiant
            return null;
        }
        
        if (fromAccountId === toAccountId) { // invalid sender cannot equal recipiant
            return null;
        }   

        if (amount <= 0) { // invalid amount
            return null;
        }

        if (timeToLiveMs <= 0) { // invalid timeToLiveMs
            return null;
        }

        if (scheduledFor < timestamp) { // invalid scheduledFor
            return null;
        }

        var scheduled = new Scheduled(timestamp, fromAccountId, toAccountId, amount, scheduledFor, timeToLiveMs);
        this.accounts[fromAccountId].push(scheduled);
        this.accounts[toAccountId].push(scheduled);
        return scheduled.id();
    }
    processScheduledTransfers(timestamp: number): string[] {
        return this.getAllTransactions(timestamp)
            .reduce<string[]>((result: string[], transaction: ITransaction) => {
                if (transaction.transactionType === "scheduled" && transaction.status(timestamp) === "pending" && transaction.scheduledFor! <= timestamp) {
                    const {amount, sender, recipient, timeToLive} = transaction as Scheduled;
                    const transferId = this.createTransfer(sender, recipient, amount, timestamp, timeToLive);
                    if (transferId) {
                        transaction.accept(timestamp);
                        result.push(transferId);
                    } else {
                        transaction.reject(timestamp);
                    }
                }

                return result;
            }, []);
    }
    getScheduledTransferIds(timestamp: number, accountId: string): string[] | null {
        const transactions = this.getAccountTransactions(timestamp, accountId);
        if (!transactions) {
            return null;
        }

        return transactions
            .filter((transaction) => {
                return transaction.transactionType === "scheduled" && transaction.status(timestamp) === "pending";
            })
            .map((transfer) => transfer.id())
    }
}
