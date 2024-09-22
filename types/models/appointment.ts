import { Member, Product, User } from "..";

export type Appointment = {
  id: number;
  start_at: string;
  end_at: string;
  join_url: string;
  member: Member;
  user: User;
  product: Product;
  status: "active" | "inacitve";
};
