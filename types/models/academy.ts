import { Addon, Language, Receipt, Subscription } from "@/types";

export type Academy = {
  id: number;
  title: string;
  logo: any;
  logo_media: any;
  favicon: string;
  email: string;
  sms_amount: number;
  support_email: string;
  vat_type: "excluded" | "included";
  vat_id: string;
  vat_percent: number;
  meta: {
    classical_authentication: boolean;
    custom_body_code: string | null;
    custom_head_code: string | null;
    custom_logged_in_code: string | null;
    custom_logged_out_code: string | null;
    default_player: boolean;
    disable_registration: boolean;
    gdpr_content: string | null;
    gdpr_enabled: boolean;
    restrict_login_ip: boolean;
    unbranded: boolean;
    disable_text_copy: boolean;
    enable_watermark: boolean;
    cf_turnstile_site_key: string;
  };
  currency: string;
  domain: string;
  slug: string;
  locale: string;
  supported_locales: Language[];
  incomplete_payments: Receipt[];
  has_payment_method: boolean;
  is_verified: boolean;
  payouts: {
    threshold: number;
    methods: Array<string>;
  };
  affiliates: {
    availability: string;
    commission: number | string;
    cookies_period: number | string;
    invited_users: Array<{ id: number; name: string }> | null;
  };
  created_at: string;
  updated_at: string;
  subscription: Subscription | null;
  addons: Addon[];
  on_trial: boolean;
  trial_ends_at: string | null;
  is_in_ksa: boolean;
  beta_enrolled: boolean;
  beta_enrolled_queue: boolean;
  appointments_count: number;
  onboarding_status: "in_progress" | "skipped" | "completed" | "old";
  onboarding_tasks_status: "skipped" | "completed" | "in_progress";
  onboarding_answers: Array<{
    id: number;
    question_id: number;
    choice_id: number;
    answer_text: string;
  }>;
  is_plus: boolean;
  colors: any;
};
