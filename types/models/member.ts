import { Media, Segment } from "@/types";

export type UserRole = {
  id: number;
  nickname: string;
  name: string;
};
export type Member = {
  id: number;
  balance: number;
  first_name: string;
  last_name: string;
  name: string;
  username: string;
  avatar: Media | null;
  bio: null | string;
  job_title: null | string;
  education: null | string;
  url: string;
  national_id: null | string;
  country_code: null | string;
  currency: null | string;
  gender: string;
  skills: Array<string>;
  email: string;
  phone_code: null | string;
  phone: null | string;
  international_phone: null | string;
  dob: null | string;
  email_verified_at: null | string;
  status: "active" | "inactive";
  last_seen_at: null | string;
  total_purchases: number;
  products_count: number;
  courses_count: number;
  is_verified: boolean;
  email_verified: boolean;
  updated_at: string;
  created_at: string;
  roles: Array<UserRole>;
  orders_count: number;
  type: "user" | "member";
  meta: {
    complete_profile: {
      [key: string]: [string];
    };
  };

  english_name: string;
  newsletter_status: string;
  segments: Array<Segment>;
};
