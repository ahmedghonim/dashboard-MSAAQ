import { Member, Order } from "@/types";

export enum TransactionType {
  WITHDRAW = "withdraw",
  DEPOSIT = "deposit"
}

export enum TransactionStatus {
  SUCCESS = "success",
  FAILED = "failed",
  FULLY_REFUNDED = "fully_refunded",
  PARTIALLY_REFUNDED = "partially_refunded"
}

export type TransactionHistory = {
  type: "deposit" | TransactionStatus.PARTIALLY_REFUNDED | TransactionStatus.FULLY_REFUNDED;
  amount: number;
  created_at: string;
  reason: string | null;
  remove_access: boolean | null;
};

export type TransactionPaymentDetails = {
  amount: number;
  net: number;
  vat: {
    net: number;
    type: "excluded" | "included";
    amount: number;
    percentage: string;
  };
  fees: {
    tax: string;
    total: string;
    msaaq_fees: string;
    gateway_fees: string;
    tax_percentage: number;
    msaaq_percentage: number;
    gateway_extra_fees: string;
    gateway_percentage: number;
  };
};

export enum TransactionDescription {
  EARNINGS_WITHDRAW_REQUEST = "earnings_withdraw_request",
  DIRECT_DEPOSIT = "direct_deposit",
  ORDER_PAYMENT = "order_payment",
  PAYOUT_REQUEST = "payout_request",
  REFUND = "refund",
  TRANSFER = "transfer"
}

export type Transaction = {
  id: number;
  uuid: string;
  type: TransactionType;
  status: TransactionStatus;
  description: TransactionDescription;
  payer: Member;
  order: Order;
  amount: number;
  refunds_amount: number;
  confirmed: boolean;
  payment_method: string;
  payment_gateway: string;
  currency: string;
  card: {
    last4: string;
    expiry_year: string;
    expiry_month: string;
    issuer_country: string;
  };
  payment_details: TransactionPaymentDetails;
  history: TransactionHistory[];
  created_at: string;
  updated_at: string;
};
