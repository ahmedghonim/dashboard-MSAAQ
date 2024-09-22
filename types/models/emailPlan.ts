export type EmailPlan = {
  id: number;
  limit: number;
  unit_amount_decimal: number;
  up_to: number;
  price: number;
  currency: string;
  interval: "monthly" | "yearly";
  stripe_id: string;
};
