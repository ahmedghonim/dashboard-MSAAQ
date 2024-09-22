import { Bank } from "@/types";

export type Gateway = {
  extra_fixed_fees: number;
  fees_value: number;
  is_active: boolean;
  gateway: {
    id: number;
    name: string;
    key: string;
    support_apple_pay: boolean;
  };
};
export type MsaaqPayBundle = {
  is_current: boolean;
  key: string;
  label: string;
  fees: {
    gateway: string;
    gateway_name: boolean;
    fees: {
      extra_fixed_fees: number;
      plan: string;
      type: number;
      value: number;
    };
  };
  msaaq_pay_fees: number;
};

export type Faq = {
  id: number;
  answer: string;
  question: string;
  category: number;
  created_at: string;
  updated_at: string;
};

export type Currency = {
  id: number;
  code: string;
  name: string;
  country_code: string;
  flag: string;
  rate: string;
  symbol: string;
};

export type CancellationReasons = {
  id: number;
  reason: string;
  created_at: string;
  updated_at: string;
};

interface Currencies extends Currency {
  default: boolean;
  is_active: boolean;
}

export type MsaaqPayInfo = {
  gateways: Gateway[];
  currencies: Currencies[];
  cancellation_reasons: CancellationReasons[];
  faq: Faq[];
  bank: Bank;
  bundles: MsaaqPayBundle[];
  vat_type: "excluded" | "included";
};
