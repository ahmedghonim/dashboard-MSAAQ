import { CertificateTemplate, Media, Page, Taxonomy } from "@/types";

export enum CourseStatus {
  DRAFT = "draft",

  PUBLISHED = "published",

  UNLISTED = "unlisted",

  SCHEDULED = "scheduled"
}

export type CourseStats = {
  current_week_sales: number;
  last_week_sales: number;
  comments: number;
  reviews: number;
  students: {
    enrolled: number;
    started: number;
    completed: number;
  };
  sales: number;
};
export type Course = {
  id: number;
  type: string;
  page: Page;
  quantity: number | string | null;
  category: Taxonomy;
  difficulty: Taxonomy;
  instructors: Array<any>;
  certification: {
    enabled: boolean;
    contents_attendance_rate: number;
    quizzes_passing_rate: number;
    meetings_attendance_rate: number;
    quizzes_passing_type: "average" | "all";
  };
  certificate_template: CertificateTemplate;
  created_at: string;
  description: string | null;
  duration: number;
  eligible_for_certificate: boolean;
  in_stock: boolean;
  is_started: boolean;
  meta: {
    can_retake_exam: boolean;
    close_enrollments: boolean;
    disable_comments: boolean;
    early_access: boolean;
    resubmit_assignment: boolean;
    show_content_instructor: boolean;
    show_enrollments_count: boolean;
  };
  meta_description: string | null;
  meta_title: string | null;
  meta_keywords: Array<string> | null;
  options: { reviews_enabled: boolean };
  outcomes: Array<string> | null | string;
  price: number;
  sales_price: number;
  earnings: number;
  publish_at: string | null;
  requirements: Array<string> | null | string;
  slug: string;
  status: CourseStatus;
  summary: string | null;
  thumbnail: Media | null;
  title: string;
  updated_at: string;
  url: string;
  checkout_url: string;
  enrollments_count: number;
  profits: number;
  intro_video: string | null;
  avg_rating: number;
  sales_this_period: number;
  sales: number;
  quizzes_score: number;
  meetings_attendance_percentage: number;
  meetings_attendance_duration: number;
  started_at: string | null;
  completed_at: string | null;
  location: {
    address: string;
    url: string;
    building: string;
    special_mark: string;
  };
  timing: {
    from: string;
    to: string;
  };
  notification: {
    before_start: boolean;
    when_start: boolean;
    after_complete: boolean;
  };
};
