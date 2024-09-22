import { Media, UserRole } from "@/types";

export enum RoleTypes {
  CONSULTANT = "consultant",
  MARKETING_MANAGER = "marketing_manager",
  FINANCIAL_MANAGER = "financial_manager",
  GENERAL_MANAGER = "general_manager",
  INSTRUCTOR = "instructor",
  ADMIN = "admin"
}
export type Role = {
  id: number;
  name: string;
  nickname: string;
};

export type User = {
  id: number;
  uuid: string;
  name: string;
  email: string;
  freshchat_id: string;
  country_code: string | null;
  avatar: Media | null;
  phone: string | null;
  phone_code: string | null;
  international_phone: string | null;
  status: string;
  email_verified: boolean;
  is_verified: boolean;
  updated_at: string;
  created_at: string;
  last_seen_at: null | string;
  roles: Array<UserRole>;
  meta: {
    education: string;
    bio: string;
    social_links: string[];
  };
  has_google_calendar: boolean;
  gender: "male" | "female";
  verification_code: string;
  phone_verified: boolean;
  phone_verification_checkpoint: any;
};
