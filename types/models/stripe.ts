export type SetupIntent = {
  client_secret: string;
};

export type Card = {
  id: string;
  is_default: boolean;
  expiry_month: number;
  expiry_year: number;
  last_four: string;
  scheme: "visa" | "mastercard" | string;
};
