import { Plan } from "@/types";

export enum SubscriptionStatus {
  ACTIVE = "active",
  TRIALING = "trialing",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  PAST_DUE = "past_due",
  UNPAID = "unpaid",
  CANCELLED = "canceled"
}

export type PaymentIntent = {
  client_secret: string;
  payment_method_id?: string;
};

export type Subscription = {
  id: number;
  payment_method: "card" | "paypal";
  card: {
    update_url: string;
    brand: "visa" | "mastercard";
    last_four: string;
    expiration_date: string;
  };
  next_payment: {
    amount: number;
    currency: string;
    date: string;
  } | null;
  on_grace_period: boolean;
  coupon: {
    name: string;
    valid: boolean;
    duration: "once" | "forever" | "repeating";
    /**
     * If `duration` is `repeating`, the number of months the coupon applies.
     * Null if coupon `duration` is `forever` or `once`.
     */
    duration_in_months: number | null;
  };
  metadata: {
    offer_new_subscription?: string | unknown;
    offer_plan_price_id?: string | unknown;
  };
  payment_intent?: PaymentIntent;
  plan?: Omit<Plan, "prices">;
  price: Plan["prices"][0];
  status: SubscriptionStatus;
  created_at: string;
  ends_at: null | string;
  paused_from: null | string;
};
