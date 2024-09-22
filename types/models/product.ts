import { Course, Media, Taxonomy, User } from "@/types";

export enum ProductType {
  DIGITAL = "digital",

  BUNDLE = "bundle",

  COACHING_SESSION = "coaching_session",
  ON_SITE = "on_site",

  ONLINE = "online"
}

export enum ProductStatus {
  DRAFT = "draft",

  PUBLISHED = "published",

  UNLISTED = "unlisted"
}

export type ProductStats = {
  current_week_sales: number;
  last_week_sales: number;
  downloads: number;
  reviews: number;
  appointments: number;
};
export type Product = {
  id: number;
  title: string;
  slug: string;
  url: string;
  checkout_url: string;
  thumbnail: Media | null;
  description: string;
  purchase_message: string;
  meta_title: string;
  meta_description: string;
  attachments: Media[];
  images: Media[] | any;
  price: number;
  sales_price: number;
  earnings: number;
  profits: number;
  downloads_count: number;
  status: ProductStatus;
  type: ProductType;
  bundle: Array<Product | Course>;
  bundle_items_count: number;
  meta: {
    reviews_enabled: boolean;
    show_downloads_count: boolean;
    purchase_message: string;
    calendar_link_type?: "custom_calendar_url" | "embed_url";
    embed_url?: string;
    custom_calendar_url?: string;
  };
  created_at: string;
  updated_at: string;
  avg_rating: number;
  sales: number;
  sales_this_period: number;
  category: Taxonomy;
  summary: string | null;
  options: {
    duration: number;
    availability: {
      user_id: number;
      user: User;
      days: {
        name: string;
        from: string;
        to: string;
      }[];
    }[];
  };
};
