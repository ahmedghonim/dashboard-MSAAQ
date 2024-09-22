import { Currency } from "./currency";

export type userBank = {
  account_name: string;
  account_number: string;
  bank_name: string;
  iban: string;
  bic: string;
  currency: {
    label: string;
    value: string;
  } | null;
};
