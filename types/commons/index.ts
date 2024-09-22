import { ProductType } from "@/types";

export * from "./APIResponse";
export * from "./PaginationLink";
export * from "./consts";
export * from "./analytics";

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type AnyObject = { [key: string]: any };

export interface EmailTemplateInputs {
  id: number;
  type: "course" | "product" | "general";
  content_type:
    | "welcome_email"
    | "enrolled_at_course"
    | "product_purchased"
    | "course_completed"
    | "content_dripped"
    | "bundle_purchased";
  mail_subject: string;
  mail_message: string;
  vars: EmailTemplate["vars"];
  default_template_for?: string;
}

export type EmailTemplate = {
  id: number;
  mailable: string;
  subject: string;
  content: string;
  vars: {
    [key: string]: string;
  };
};

export type Notification = {
  id: string;
  type: string;
  read_at: string | null;
  title: string;
  body: string;
  payload: any;
  created_at: string;
};

export type NotificationsData = {
  notifications: Notification[];
  total: number;
  unread_count: number;
};
export type NotificationsSettings = {
  settings: {
    member: {
      welcome_email: boolean;
      comment_replied: boolean;
      invoice_created: boolean;
      course_completed: boolean;
      content_dripped: boolean;
      zoom_meeting_started: boolean;
      certificate_created: boolean;
      use_bundle_default_template: boolean;
      use_coaching_session_default_template: boolean;
      use_course_default_template: boolean;
      use_digital_default_template: boolean;
      restore_bundle_default_template: boolean;
      restore_coaching_session_default_template: boolean;
      restore_course_default_template: boolean;
      restore_digital_default_template: boolean;
    };
    academy: {
      member_created: boolean;
      order_created: boolean;
      course_completed: boolean;
      assessment_submitted: boolean;
      comment_created: boolean;
      review_created: boolean;
    };
    restore: boolean;
    type: string;
  };
  courses_enrollment_messages: {
    id: number;
    title: string;
    enrollment_message: string | null;
    enrollment_message_subject: string | null;
  }[];
  products_purchase_messages: {
    id: number;
    title: string;
    type: ProductType;
    purchase_message: string | null;
    purchase_message_subject: string | null;
  }[];
  email_templates: Array<EmailTemplate>;
};

export interface DateRangeType {
  from: Date | undefined;
  formatted_from?: string;
  to: Date | undefined;
  formatted_to?: string;
}
