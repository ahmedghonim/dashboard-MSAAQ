import { Certificate, Course, Member } from "@/types";

export type Enrollment = {
  id: number;
  course: Course;
  member: Member;
  certificate: Certificate;
  percentage_completed: number | string | null;
  has_certification: boolean;
  contents_count: number;
  started_at: string | null;
  completed_at: null | string;
  updated_at: string;
  created_at: string;
};
