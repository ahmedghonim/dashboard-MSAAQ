import { Course, Member, Product } from "@/types";

export enum OrderStatus {
  PENDING = "pending",
  ON_HOLD = "on_hold",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  PAYMENT_FAILED = "payment_failed"
}

export type SessionSource = {
  browser_name: string;
  browser_version: string;
  device_family: string;
  device_model: string;
  device_type: string;
  os_name: string;
  os_version: string;
  referer: string;
};

type OrderItem = {
  id: number;
  type: "product" | "course";
  product: Course | Product;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: number;
  uuid: string;
  payment_method: string;
  coupon_code?: null;
  currency: string;
  subtotal: number;
  total: number;
  tax: number;
  tax_percentage: number;
  tax_type: string;
  discount: number;
  affiliate_split: number;
  earnings: number;
  status: OrderStatus;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
  member: Member;
  referred_by?: Member;
  items_count: number;
  items: OrderItem[];
  source: SessionSource;
  gateway_fees: number;
};
