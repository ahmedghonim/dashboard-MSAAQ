export type MsaaqAffiliateSettings = {
  setting: {
    commission: number;
    payouts_min_amount: number;
    is_available_for_payout: boolean;
  };
  balance: {
    earnings: number;
    available_balance: number;
  };
  stats: {
    referrals: number;
    subscribed_referrals: number;
  };
  referral_link: string;
};
