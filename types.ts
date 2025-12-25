
export enum AccountType {
  DEMO = 'DEMO',
  REAL = 'REAL'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum KYCStatus {
  UNSUBMITTED = 'UNSUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED'
}

export interface UserProfile {
  uid: string;
  email: string;
  demoBalance: number;
  realBalance: number;
  kycStatus: KYCStatus;
  kycData?: {
    fullName: string;
    idNumber: string;
    frontImage: string;
    backImage: string;
    submittedAt: number;
  };
}

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  direction: 'UP' | 'DOWN';
  amount: number;
  entryPrice: number;
  expiryTime: number;
  createdAt: number;
  accountType: AccountType;
  status: 'OPEN' | 'WIN' | 'LOSS';
  profit: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  method: string;
  network?: string;
  status: TransactionStatus;
  createdAt: number;
  address?: string;
  isCredited?: boolean; // Tracking for auto-balance credit
}

export type Timeframe = '5s' | '10s' | '30s' | '1m' | '5m' | '15m' | '30m';