export interface ITransaction {
    timestamp: number;
    amount: number;
    transactionType: "deposit" | "withdrawal" | "transfer" | "scheduled";

    timeToLive?: number;
    status(timestamp: number): "accepted" | "pending" | "expired" | "rejected";
    accept(timestamp: number): boolean;
    reject(timestamp: number): boolean;

    sender?: string;
    recipient: string;

    id(): string;

    scheduledFor?: number;
}

export class Transaction implements ITransaction {
    public readonly timestamp: number;
    public readonly amount: number;
    public readonly transactionType: "deposit" | "withdrawal";
    public readonly recipient: string;

    private static ordinalCount = 0;
    private _id: string;

    constructor(timestamp:number, amount:number, transactionType: "deposit" | "withdrawal", recipient: string) {
        this.timestamp=timestamp;
        this.amount=amount;
        this.transactionType=transactionType;
        this.recipient=recipient;

        this._id = `transaction${Transaction.ordinalCount++}`;
    }
    
    accept(timestamp: number): boolean {
        return false;
    }

    reject(timestamp: number): boolean {
        return false;
    }

    status(): "accepted" {
        return "accepted";
    }

    id(): string {
        return this._id;
    }
}

export class Transfer implements ITransaction {
    public readonly timestamp: number;
    public readonly amount: number;
    public readonly transactionType: "transfer";
    public readonly sender: string;
    public readonly recipient: string;
    public readonly timeToLive: number;


    private static ordinalCount = 0;
    private _id: string;
    private _accepted: boolean;
    public readonly _expiration: number;

    constructor(timestamp: number, amount: number, sender: string, recipient: string, timeToLive: number) {
        this.timestamp=timestamp;
        this.amount=amount;
        this.transactionType="transfer";
        this.sender=sender;
        this.recipient=recipient;
        this.timeToLive=timeToLive;

        this._accepted = false;
        this._id = `transfer${Transfer.ordinalCount++}`;
        this._expiration = timestamp + timeToLive;
    }

    status(timestamp: number): "accepted" | "pending" | "expired" {
        if (this._accepted) {
            return "accepted";
        }

        if (timestamp > this._expiration) {
            return "expired";
        }

        return "pending";
    }
    
    accept(timestamp:number): boolean {
        if (this.status(timestamp) === "pending") {
            this._accepted = true;
            return true;
        }

        return false;
    }
    
    reject(timestamp: number): boolean {
        return false;
    }

    id(): string {
        return this._id;
    }
}

export class Scheduled implements ITransaction {
    public readonly timestamp: number;
    public readonly amount: number;
    public readonly transactionType: "scheduled";
    public readonly scheduledFor: number;
    public readonly sender: string;
    public readonly recipient: string;
    public readonly timeToLive: number;

    private static ordinalCount = 0;
    private _id: string;
    private _accepted: boolean;
    private _rejected: boolean;

    constructor(
        timestamp: number,
        fromAccountId: string,
        toAccountId: string,
        amount: number,
        scheduledFor: number,
        timeToLive: number
    ) {
        this.timestamp = timestamp;
        this.sender = fromAccountId;
        this.recipient = toAccountId;
        this.amount = amount;
        this.scheduledFor = scheduledFor;
        this.transactionType = "scheduled";
        this.timeToLive = timeToLive;

        this._accepted = false;
        this._rejected = false;
        this._id = `scheduled${Scheduled.ordinalCount++}`;
    }
    status(timestamp: number): "accepted" | "pending" | "rejected" {
        if (this._accepted) {
            return "accepted";
        }

        if (this._rejected) {
            return "rejected";
        }

        return "pending";
    }
    accept(timestamp: number): boolean {
        if (this.status(timestamp) === "pending") {
            this._accepted = true;
            return true;
        }

        return false;
    }
    reject(timestamp: number): boolean {
        if (this.status(timestamp) === "pending") {
            this._rejected = true;
            return true;
        }

        return false;
    }
    id(): string {
        return this._id;
    }
}