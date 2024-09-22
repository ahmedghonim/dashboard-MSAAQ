import { Course, Product } from "@/types";

export type Stats = {
  members: number;
  revenue: number;
  comments: number;
  orders: number;
};

export type Chart = {
  courses: [{ date: string; aggregate: number }];
  products: [{ date: string; aggregate: number }];
};

export type bestSellers = {
  sales_count: number;
  total_revenue: number;
  type: "product" | "course";
  product: Product | Course;
};
export type topCountries = {
  country_code: string | null;
  sales_count: number;
  total_revenue: number;
};
