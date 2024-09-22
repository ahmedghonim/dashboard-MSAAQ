import { Campaign, Course, Member, Product, Segment } from "..";

export type Send = {
  id: number;
  status: "pending" | "sent" | "failed" | "invalid";
  member: Member;
  campaign: Campaign;
  opens: any;
  clicks_count: number;
  sent_at: string;
  created_at: string;
  opened_at: string;
};
