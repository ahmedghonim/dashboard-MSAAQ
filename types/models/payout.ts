import { Bank, Media, TransactionDescription, TransactionType } from "@/types";

export enum PayoutStatus {
  PENDING = "pending",
  APPROVED = "approved",
  DECLINED = "declined"
}

export type Payout = {
  id: number;
  uuid: string;
  type: TransactionType;
  status: PayoutStatus;
  description: TransactionDescription;
  bank: Bank;
  amount: number;
  exchange_rate_difference: null | number;
  processing_fees: null | number;
  declined_reason: null | string;
  confirmed: boolean;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type PayoutSettings = {
  bank: Bank;
  currency: string;
  available_balance: number;
  min_payout_amount: number;
};
