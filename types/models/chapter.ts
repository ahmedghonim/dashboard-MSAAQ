import { Content, Course } from "@/types";

export type Chapter = {
  id: number;
  title: string;
  sort: number;
  drip_enabled: boolean;
  drip_after: number | string;
  drip_type: string;
  drip_email_subject: string | null;
  drip_email_content: string | null;
  updated_at: string;
  created_at: string;
  contents: Array<Content>;
  course: Course;
  hidden: boolean;
  dripped_at: string;
};
