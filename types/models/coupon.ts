import { Course, Member, Product, Segment } from "@/types";

export enum CouponType {
  PERCENTAGE = "percentage",
  FLat = "flat"
}

export type Coupon = {
  id: number | string;
  code: string;
  amount: number;
  type: CouponType;
  enabled: boolean;
  minimum_amount: number;
  maximum_amount: number;
  usage_limit: number;
  usage_limit_per_user: number;
  expiry_at: string;
  expired: boolean;

  allowed_products: Array<Product | Course>;
  excluded_products: Array<Product | Course>;
  allowed_segments: Array<Segment>;
  excluded_segments: Array<Segment>;
};

export type CouponUse = {
  coupon: Coupon;
  member: Member;
  usage: number;
};
export type CouponStats = {
  members_count: number;
  uses_count: number;
  sales: number;
};
