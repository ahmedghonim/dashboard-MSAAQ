import { Member } from "@/types";

export type AffiliatePayout = {
  id: number | string | undefined;
  member: Member;
  amount: number;
  method: string;
  receipt: Object | any;
  confirmed: boolean;
  created_at: string;
  payout_details: Object | any;
};
