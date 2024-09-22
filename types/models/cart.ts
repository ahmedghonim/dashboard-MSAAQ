import { Member } from "@/types";
import { CouponType } from "@/types/models/coupon";

export type Cart = {
  id: number;
  uuid: string;
  email: string | null;
  member:
    | (Member & {
        __temp_member?: boolean;
      })
    | null;
  total: number;
  currency: string;
  items_count: number;
  created_at: string;
  updated_at: string;
};
export enum ReminderStatus {
  ACTIVE = "active",
  INACTIVE = "inactive"
}

export type Reminder = {
  id: number;
  uuid: string;
  status: ReminderStatus;
  channel: "sms" | "email";
  //duration in days
  abandonment_duration: number;
  cart_min_total: number;
  //duration hours
  discount_duration: number;
  discount_type: CouponType;
  discount: number;
  message: string;
};
