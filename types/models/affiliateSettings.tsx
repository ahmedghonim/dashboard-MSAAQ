import { Member } from "@/types";

export enum AffiliateSettingsAvailability {
  CLOSED = "closed",
  ANYONE = "anyone",
  INVITE_ONLY = "invite-only"
}
export type AffiliateSettings = {
  availability: AffiliateSettingsAvailability;
  commission: number | string;
  cookies_period: number | string;
  payouts: {
    threshold: number;
    methods: Array<string>;
    commission: number;
    availability: AffiliateSettingsAvailability;
    cookies_period: number;
  };
  invited_users: Array<Member>;
};
