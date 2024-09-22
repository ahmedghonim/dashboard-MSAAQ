import { PaymentIntent } from "@/types";

export type ReceiptItem = {
  amount: number;
  currency: string;
  description: string;
  id: string;
  quantity: number;
};

export type Receipt = {
  id: number;
  checkout_id: string;
  total: number;
  tax: number;
  currency: string;
  quantity: number;
  receipt_url: string;
  created_at: string;
  status: "deleted" | "draft" | "open" | "paid" | "uncollectible" | "void";
  payment_intent: null | PaymentIntent;
  paid_at: string;
  items: ReceiptItem[];
};
