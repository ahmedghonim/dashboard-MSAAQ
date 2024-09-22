export type Bank = {
  id: number;
  account_name: string;
  account_number: string;
  bank_name: string;
  bic: string;
  iban: string;
  created_at: string;
  updated_at: string;
  currency:
    | {
        label: string;
        value: string;
      }
    | string;
};
