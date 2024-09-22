import { Media, Member, Order } from "@/types";

export enum BankTransferStatus {
  PENDING = "pending",
  PAID = "paid",
  CANCELLED = "cancelled"
}

export type BankTransfer = {
  id: number;
  status: BankTransferStatus;
  member: Member;
  order: Order;
  cart: Order;
  receipt: Media;
  created_at: string;
  updated_at: string;
};
