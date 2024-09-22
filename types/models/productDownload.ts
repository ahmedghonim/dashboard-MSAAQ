import { Member, Product } from "@/types";

export type ProductDownload = {
  id: number;
  member: Member;
  product?: Product;
  created_at: string;
};
